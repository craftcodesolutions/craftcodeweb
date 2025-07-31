/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'; // Import cookies from next/headers
import clientPromise from '@/config/mongodb'; // Assuming you need to fetch user data from DB

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const COLLECTION = 'users';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const authToken = (await cookieStore).get('authToken')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { userId } = decoded;

    // Fetch user details from database (optional, but good for real-time data)
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    const user = await usersCollection.findOne({ _id: new (require('mongodb')).ObjectId(userId) }); // Convert userId string to ObjectId

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return only necessary user information (avoid sending password hash)
    return NextResponse.json({
      userId: user._id.toString(),
      email: user.email,
      bio: user.bio || '',
      firstName: user.firstName || null, // Include if you have these fields
      lastName: user.lastName || null,
      isAdmin: user.isAdmin || false,
      profileImage: user.profileImage || '',
    }, { status: 200 });

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}