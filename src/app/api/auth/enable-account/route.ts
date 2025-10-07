import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const DISABLED_ACCOUNTS_COLLECTION = 'disabled_accounts';
const USERS_COLLECTION = 'users';

interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get auth token from cookies
    const authToken = req.cookies.get('authToken')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only allow admins or the user themselves to enable account
    if (decoded.userId !== userId && !decoded.isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const disabledAccountsCollection = db.collection(DISABLED_ACCOUNTS_COLLECTION);
    const usersCollection = db.collection(USERS_COLLECTION);

    // Check if account is disabled
    const disabledAccount = await disabledAccountsCollection.findOne({ userId });

    if (!disabledAccount) {
      return NextResponse.json({ error: 'Account is not disabled' }, { status: 400 });
    }

    // Remove from disabled accounts collection
    await disabledAccountsCollection.deleteOne({ userId });

    // Update user status in users collection
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          status: true, 
          updatedAt: new Date()
        },
        $unset: {
          disabledAt: ""
        }
      }
    );

    console.log(`✅ Account enabled: ${disabledAccount.email} (${userId})`);

    return NextResponse.json({ 
      success: true, 
      message: 'Account enabled successfully',
      enabledAccount: {
        userId,
        email: disabledAccount.email,
        enabledAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error enabling account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
