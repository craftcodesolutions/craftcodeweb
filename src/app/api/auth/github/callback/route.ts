/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import clientPromise from '@/config/mongodb';
import { getSocketIO } from '@/lib/socketServer';

const DB_NAME = 'CraftCode';
const COLLECTION = 'users';
const SESSIONS_COLLECTION = 'user_sessions';
const DISABLED_ACCOUNTS_COLLECTION = 'disabled_accounts';

function generateDeviceId(userAgent: string, ipAddress: string): string {
  return createHash('sha256').update(`${userAgent}-${ipAddress}`).digest('hex').substring(0, 16);
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error('❌ No access token:', tokenData);
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 401 });
    }

    const profileRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();

    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emails = await emailRes.json();
    const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email || profile.email;

    if (!primaryEmail) {
      console.error('❌ No verified primary email');
      return NextResponse.json({ error: 'No verified email found' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);
    const disabledAccountsCollection = db.collection(DISABLED_ACCOUNTS_COLLECTION);

    const nameParts = profile.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    let user = await usersCollection.findOne({ email: primaryEmail });

    // Check if account is disabled before proceeding
    if (user) {
      const disabledAccount = await disabledAccountsCollection.findOne({
        $or: [
          { userId: user._id.toString() },
          { email: primaryEmail }
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
        email: primaryEmail,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || profile.login || primaryEmail.split('@')[0],
        picture: profile.avatar_url || '',
        profileImage: profile.avatar_url || '',
        avatar: profile.avatar_url || '',
        bio: profile.bio || '',
        isAdmin: false,
        status: true,
        password: null,
        provider: 'github',
        providerId: profile.id?.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await usersCollection.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
      console.log(`✅ New GitHub user created: ${primaryEmail}`);
    } else {
      console.log(`✅ Existing GitHub user login: ${primaryEmail} (no data update needed)`);
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
      process.env.JWT_SECRET!,
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

    console.log(`✅ GitHub OAuth session created for user: ${primaryEmail} (Device: ${deviceId})`);

    try {
      const io = getSocketIO();
      if (io) {
        console.log(`✅ Socket.IO available for GitHub OAuth user ${primaryEmail} - real-time features enabled`);
      } else {
        console.log(`⚠️ Socket.IO not available for GitHub OAuth user ${primaryEmail} - will initialize on first socket connection`);
      }
    } catch (socketError) {
      console.error('Socket.IO check failed during GitHub OAuth:', socketError);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.craftcodesolutions.com';
    const res = NextResponse.redirect(`${baseUrl}/?auth=github`);

    res.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    res.cookies.set('userEmail', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    console.log(`✅ GitHub OAuth completed for ${primaryEmail} - redirecting to dashboard`);
    return res;
  } catch (err) {
    console.error('❌ GitHub OAuth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}