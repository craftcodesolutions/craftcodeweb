import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';
import { getSocketIO } from '@/lib/socketServer';
import { createHash } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET!;
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
    const tokenRes = await fetch(`https://oauth2.googleapis.com/token`, {
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

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profile = await profileRes.json();

    const email = profile.email?.toLowerCase();
    const firstName = profile.given_name || '';
    const lastName = profile.family_name || '';
    const profileImage = profile.picture;

    if (!email) {
      return NextResponse.json({ error: 'No email received from Google' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(COLLECTION);
    const disabledAccountsCollection = db.collection(DISABLED_ACCOUNTS_COLLECTION);

    let user = await users.findOne({ email });

    // Check if account is disabled before proceeding
    if (user) {
      const disabledAccount = await disabledAccountsCollection.findOne({
        $or: [
          { userId: user._id.toString() },
          { email: email }
        ]
      });

      if (disabledAccount) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=account_disabled&message=Account is disabled. Please contact support to reactivate your account.`
        );
      }
    }

    if (!user) {
      const newUser = {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
        picture: profileImage || '',
        profileImage: profileImage || '',
        bio: '',
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
      console.log(`✅ New Google user created: ${email}`);
    } else {
      console.log(`✅ Existing Google user login: ${email} (no data update needed)`);
    }

    if (!user) {
      console.error('❌ Failed to create or fetch user');
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
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
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const deviceId = generateDeviceId(userAgent, ipAddress);

    const sessionsCollection = db.collection(SESSIONS_COLLECTION);
    const sessionData = {
      userId: user._id.toString(),
      deviceId,
      token,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

    console.log(`✅ Google OAuth session created for user: ${email} (Device: ${deviceId})`);

    try {
      const io = getSocketIO();
      if (io) {
        console.log(`✅ Socket.IO available for Google OAuth user ${email} - real-time features enabled`);
      } else {
        console.log(`⚠️ Socket.IO not available for Google OAuth user ${email} - will initialize on first socket connection`);
      }
    } catch (socketError) {
      console.error('Socket.IO check failed during Google OAuth:', socketError);
    }

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

    console.log(`✅ Google OAuth completed for ${email} - redirecting to dashboard`);
    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}