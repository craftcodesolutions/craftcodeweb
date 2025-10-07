import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { getSocketIO } from '@/lib/socketServer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const COLLECTION = 'users';
const SESSIONS_COLLECTION = 'user_sessions';
const DISABLED_ACCOUNTS_COLLECTION = 'disabled_accounts';

function generateDeviceId(userAgent: string, ipAddress: string): string {
  return createHash('sha256').update(`${userAgent}-${ipAddress}`).digest('hex').substring(0, 16);
}

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

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);
    const disabledAccountsCollection = db.collection(DISABLED_ACCOUNTS_COLLECTION);

    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if account is disabled
    const disabledAccount = await disabledAccountsCollection.findOne({
      $or: [
        { userId: user._id.toString() },
        { email: email.toLowerCase() }
      ]
    });

    if (disabledAccount) {
      return NextResponse.json({ 
        error: 'Account is disabled. Please contact support to reactivate your account.',
        disabled: true,
        disabledAt: disabledAccount.disabledAt,
        reason: disabledAccount.reason
      }, { status: 403 });
    }

    if (!user.status) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = getClientIP(req);
    const deviceId = generateDeviceId(userAgent, ipAddress);

    try {
      const decodedToken = jwt.decode(token) as { exp?: number } | null;
      const expiresAt = decodedToken && decodedToken.exp ? new Date(decodedToken.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const sessionData = {
        userId: user._id.toString(),
        deviceId,
        token,
        userAgent,
        ipAddress,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      await sessionsCollection.findOneAndUpdate(
        { userId: user._id.toString(), deviceId },
        {
          $set: {
            ...sessionData,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      console.log(`Session created/updated for user ${user.email} on device ${deviceId}`);
    } catch (sessionError) {
      console.error('Failed to save session:', sessionError);
    }

    try {
      const io = getSocketIO();
      if (io) {
        console.log(`✅ Socket.IO available for user ${user.email} - real-time features enabled`);
      } else {
        console.log(`⚠️ Socket.IO not available for user ${user.email} - will initialize on first socket connection`);
      }
    } catch (socketError) {
      console.error('Socket.IO check failed during login:', socketError);
    }

    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        userId: user._id.toString(),
        id: user._id.toString(),
        email: user.email,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        name: user.name,
        isAdmin: user.isAdmin,
        profileImage: user.picture || user.profileImage || '',
        bio: user.bio || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }, { status: 200 });

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}