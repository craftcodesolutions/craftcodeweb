import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is required");
}

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const DB_NAME = 'CraftCode';
const USERS_COLLECTION = 'users';
const SESSIONS_COLLECTION = 'user_sessions';

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token found' }, { status: 401 });
    }

    // Verify refresh token
    let decoded: { userId?: string } | null = null;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId?: string };
    } catch (err) {
      console.error('Refresh token verification failed:', err);
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const userId = decoded?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid refresh token payload' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);

    // Get user from database
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0,
          resetToken: 0,
          resetTokenExpiry: 0,
        },
      }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.status) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
    }

    // Generate new access token (short-lived)
    const newAccessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Optionally generate a new refresh token (long-lived)
    const newRefreshToken = jwt.sign(
      { userId: user._id.toString() },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Get device information
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = getClientIP(req);
    const deviceId = generateDeviceId(userAgent, ipAddress);

    // Update session in database
    try {
      await sessionsCollection.findOneAndUpdate(
        { userId: user._id.toString(), deviceId },
        {
          $set: {
            token: newAccessToken,
            refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (sessionError) {
      console.error('Failed to update session:', sessionError);
    }

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false,
        status: user.status,
      },
    }, { status: 200 });

    // Set cookies
    response.cookies.set('authToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    response.cookies.set('userEmail', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}

// Helper functions
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');

  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  return 'unknown';
}

function generateDeviceId(userAgent: string, ipAddress: string): string {
  return createHash('sha256').update(`${userAgent}-${ipAddress}`).digest('hex').substring(0, 16);
}
