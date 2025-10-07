import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const USERS_COLLECTION = 'users';
const SESSIONS_COLLECTION = 'user_sessions';

export async function POST(req: NextRequest) {
  try {
    // Get current token from cookies
    const currentToken = req.cookies.get('authToken')?.value;
    
    if (!currentToken) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    // Verify current token
    let decoded: { userId?: string } | null = null;
    try {
      decoded = jwt.verify(currentToken, JWT_SECRET) as { userId?: string } | null;
    } catch (err) {
      console.error('Token verification failed:', err);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = decoded?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);

    // Get fresh user data from database
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

    // Generate new JWT token with fresh user data
    const newToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
      JWT_SECRET,
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
            token: newToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (sessionError) {
      console.error('Failed to update session:', sessionError);
      // Continue even if session update fails
    }

    // Create response with new token
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

    // Set new token in cookies
    response.cookies.set('authToken', newToken, {
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
      maxAge: 7 * 24 * 60 * 60, // 7 days
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
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function generateDeviceId(userAgent: string, ipAddress: string): string {
  return createHash('sha256').update(`${userAgent}-${ipAddress}`).digest('hex').substring(0, 16);
}
