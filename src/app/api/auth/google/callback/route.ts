import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';
import { io as ClientIO } from 'socket.io-client';
import { createHash } from 'crypto';

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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
  }

  try {
    // 1️⃣ Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
    }

    // 2️⃣ Get user info
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();

    const email = profile.email?.toLowerCase();
    const firstName = profile.given_name || '';
    const lastName = profile.family_name || '';
    const profileImage = profile.picture || '';

    if (!email) {
      return NextResponse.json({ error: 'No email received from Google' }, { status: 400 });
    }

    // 3️⃣ Database logic
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(COLLECTION);
    const disabledAccounts = db.collection(DISABLED_ACCOUNTS_COLLECTION);
    const sessions = db.collection(SESSIONS_COLLECTION);

    let user = await users.findOne({ email });

    // Disabled account check
    if (user) {
      const disabled = await disabledAccounts.findOne({
        $or: [{ userId: user._id.toString() }, { email }],
      });
      if (disabled) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=account_disabled`
        );
      }
    }

    // Create user if needed
    if (!user) {
      const newUser = {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
        profileImage,
        isAdmin: false,
        status: true,
        password: null,
        provider: 'google',
        providerId: profile.sub || profile.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await users.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
      console.log(`✅ Created new Google user: ${email}`);
    }

    // 4️⃣ JWT creation
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5️⃣ Save session
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const deviceId = generateDeviceId(userAgent, ipAddress);

    await sessions.findOneAndUpdate(
      { userId: user._id.toString(), deviceId },
      {
        $set: {
          userId: user._id.toString(),
          deviceId,
          token,
          userAgent,
          ipAddress,
          isActive: true,
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true }
    );

    console.log(`✅ Session created for ${email} (${deviceId})`);

    // 6️⃣ Connect to Socket.IO server via SOCKET_URL
    try {
      const socket = ClientIO(SOCKET_URL, {
        path: '/api/socket',
        transports: ['websocket'],
        extraHeaders: {
          Cookie: `authToken=${token}`,
        },
      });

      socket.on('connect', () => {
        console.log(`🔌 Connected to Socket.IO for user ${email}`);
        socket.emit('userLoggedIn', {
          userId: user._id.toString(),
          email: user.email,
          timestamp: new Date().toISOString(),
        });
        setTimeout(() => socket.disconnect(), 2000); // auto disconnect after notifying
      });

      socket.on('connect_error', (err) => {
        console.error(`⚠️ Socket connection failed for ${email}:`, err.message);
      });
    } catch (socketErr) {
      console.error(`❌ Failed to connect Socket.IO for ${email}:`, socketErr);
    }

    // 7️⃣ Redirect user with cookies
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?auth=google`);
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

    console.log(`✅ Google OAuth complete for ${email}`);
    return response;
  } catch (err) {
    console.error('❌ OAuth callback error:', err);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
