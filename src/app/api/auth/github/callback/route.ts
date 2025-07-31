/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/config/mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'users';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 });

    // 1. Exchange code for access token
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

    // 2. Fetch user profile
    const profileRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();

    // 3. Fetch email
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const emails = await emailRes.json();
    const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email || profile.email;

    if (!primaryEmail) {
      console.error('❌ No verified primary email');
      return NextResponse.json({ error: 'No verified email found' }, { status: 400 });
    }

    // 4. MongoDB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    const nameParts = profile.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 5. Upsert and manually fetch
    await usersCollection.updateOne(
      { email: primaryEmail },
      {
        $setOnInsert: {
          firstName,
          lastName,
          email: primaryEmail,
          avatar: profile.avatar_url || '',
          isAdmin: false,
          createdAt: new Date(),
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );

    const user = await usersCollection.findOne({ email: primaryEmail });

    if (!user) {
      console.error('❌ Failed to create or fetch user from DB');
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }

    // 6. JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 7. Redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.craftcodesolutions.com';
    const res = NextResponse.redirect(`${baseUrl}/`);

    res.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error('❌ GitHub OAuth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
