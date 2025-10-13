/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import clientPromise from '@/config/mongodb';
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

/**
 * Generate a unique device ID based on user agent + IP
 */
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
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(`GitHub token exchange failed: ${text}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
    }

    // 2️⃣ Fetch GitHub user info
    const profileRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) throw new Error(`Failed to fetch GitHub profile`);
    const profile = await profileRes.json();

    // 3️⃣ Fetch verified email (GitHub sometimes doesn't return email in profile)
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emails = await emailRes.json();
    const email =
      emails.find((e: any) => e.primary && e.verified)?.email || profile.email?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'No verified email found from GitHub' }, { status: 400 });
    }

    // 4️⃣ Database logic
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

    // Create user if not exists
    if (!user) {
      const [firstName, ...rest] = (profile.name || '').split(' ');
      const newUser = {
        email,
        firstName: firstName || '',
        lastName: rest.join(' ') || '',
        name:
          profile.name?.trim() ||
          profile.login ||
          email.split('@')[0],
        profileImage: profile.avatar_url || '',
        bio: profile.bio || '',
        isAdmin: false,
        status: true,
        password: null,
        provider: 'github',
        providerId: profile.id?.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await users.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
      console.log(`✅ Created new GitHub user: ${email}`);
    }

    // 5️⃣ Create JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6️⃣ Save session
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

    // 7️⃣ Notify Socket.IO server
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
          provider: 'github',
          timestamp: new Date().toISOString(),
        });
        setTimeout(() => socket.disconnect(), 2000);
      });

      socket.on('connect_error', (err) => {
        console.error(`⚠️ Socket connection failed for ${email}:`, err.message);
      });
    } catch (socketErr) {
      console.error(`❌ Failed to connect Socket.IO for ${email}:`, socketErr);
    }

    // 8️⃣ Redirect with cookies
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?auth=github`);
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

    console.log(`✅ GitHub OAuth complete for ${email}`);
    return response;
  } catch (err) {
    console.error('❌ GitHub OAuth callback error:', err);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
