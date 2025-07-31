import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const DB_NAME = 'CraftCode';
const COLLECTION = 'users';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found' }, { status: 400 });
  }

  try {
    // 1. Exchange code for token
    const tokenRes = await fetch(`https://oauth2.googleapis.com/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: 'http://localhost:3000/api/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
    }

    // 2. Get user info using access token
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

    // 3. Check or create user in DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(COLLECTION);

    let user = await users.findOne({ email });

    if (!user) {
      const newUser = {
        email,
        firstName,
        lastName,
        profileImage,
        isAdmin: false,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await users.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
    }

    // 4. Issue JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Set cookies
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`);
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
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
