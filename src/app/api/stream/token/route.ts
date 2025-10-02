import { NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import clientPromise from '@/config/mongodb';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const COLLECTION = 'users';

export async function POST() {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    // Verify JWT token
    let decoded: { userId: string; [key: string]: unknown };
    try {
      const result = jwt.verify(authToken, JWT_SECRET);
      if (typeof result === 'string') {
        return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
      }
      decoded = result as { userId: string; [key: string]: unknown };
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { userId } = decoded;

    // Fetch user details from database
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    const { ObjectId } = await import('mongodb');
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(userId) 
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check Stream API credentials
    if (!STREAM_API_KEY) {
      return NextResponse.json({ error: 'Stream API key is missing' }, { status: 500 });
    }
    if (!STREAM_API_SECRET) {
      return NextResponse.json({ error: 'Stream API secret is missing' }, { status: 500 });
    }

    // Create Stream client and generate token
    const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

    const token = streamClient.createToken(userId, expirationTime, issuedAt);

    return NextResponse.json({ 
      token,
      userId: user._id.toString(),
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      userImage: user.profileImage || ''
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating stream token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
