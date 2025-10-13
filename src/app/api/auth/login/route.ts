import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { io as ClientIO } from 'socket.io-client';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const JWT_SECRET = process.env.JWT_SECRET;
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3008';

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
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
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
    const users = db.collection(COLLECTION);
    const sessions = db.collection(SESSIONS_COLLECTION);
    const disabledAccounts = db.collection(DISABLED_ACCOUNTS_COLLECTION);

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    // Disabled account check
    const disabled = await disabledAccounts.findOne({
      $or: [{ userId: user._id.toString() }, { email: email.toLowerCase() }]
    });
    if (disabled) {
      return NextResponse.json({
        error: 'Account is disabled. Contact support.',
        disabled: true,
        disabledAt: disabled.disabledAt,
        reason: disabled.reason
      }, { status: 403 });
    }

    if (!user.status) return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    // Create JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Session handling
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = getClientIP(req);
    const deviceId = generateDeviceId(userAgent, ipAddress);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const sessionData = {
      userId: user._id.toString(),
      deviceId,
      token,
      userAgent,
      ipAddress,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    await sessions.findOneAndUpdate(
      { userId: user._id.toString(), deviceId },
      { $set: { ...sessionData, updatedAt: new Date() } },
      { upsert: true }
    );

    // Socket.IO notification
    try {
      const socket = ClientIO(SOCKET_URL, {
        path: '/api/socket',
        transports: ['websocket'],
        extraHeaders: { Cookie: `authToken=${token}` }
      });

      socket.on('connect', () => {
        socket.emit('userLoggedIn', {
          userId: user._id.toString(),
          email: user.email,
          provider: 'local',
          timestamp: new Date().toISOString()
        });
        setTimeout(() => socket.disconnect(), 2000);
      });

      socket.on('connect_error', (err) => console.error('Socket.IO connect error:', err.message));
    } catch (socketErr) {
      console.error('Socket.IO error during login:', socketErr);
    }

    // Response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user._id.toString(),
        email: user.email,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join('') || '',
        name: user.name,
        isAdmin: user.isAdmin,
        profileImage: user.picture || user.profileImage || '',
        bio: user.bio || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }, { status: 200 });

    // Cookies
    response.cookies.set('authToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 });
    response.cookies.set('userEmail', user.email, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
