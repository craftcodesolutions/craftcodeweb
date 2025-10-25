import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'CraftCode');
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ userId: user._id.toString() }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/users/by-email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
