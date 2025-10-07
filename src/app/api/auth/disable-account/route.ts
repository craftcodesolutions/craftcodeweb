import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const DISABLED_ACCOUNTS_COLLECTION = 'disabled_accounts';
const USERS_COLLECTION = 'users';
const SESSIONS_COLLECTION = 'user_sessions';

interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email, reason } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
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

    // Only allow users to disable their own account
    if (decoded.userId !== userId) {
      return NextResponse.json({ error: 'You can only disable your own account' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const disabledAccountsCollection = db.collection(DISABLED_ACCOUNTS_COLLECTION);
    const usersCollection = db.collection(USERS_COLLECTION);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);

    // Check if account is already disabled
    const existingDisabled = await disabledAccountsCollection.findOne({
      $or: [{ userId }, { email: email.toLowerCase() }]
    });

    if (existingDisabled) {
      return NextResponse.json({ error: 'Account is already disabled' }, { status: 400 });
    }

    // Create disabled account record
    const disabledAccountData = {
      userId,
      email: email.toLowerCase(),
      disabledAt: new Date(),
      reason: reason || 'Account disabled by user',
      disabledBy: decoded.userId,
      createdAt: new Date(),
    };

    await disabledAccountsCollection.insertOne(disabledAccountData);

    // Update user status in users collection
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          status: false, 
          disabledAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Deactivate all user sessions
    await sessionsCollection.updateMany(
      { userId },
      { 
        $set: { 
          isActive: false, 
          updatedAt: new Date(),
          deactivatedReason: 'Account disabled'
        } 
      }
    );

    console.log(`✅ Account disabled: ${email} (${userId}) - Reason: ${reason}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Account disabled successfully',
      disabledAccount: {
        userId,
        email: email.toLowerCase(),
        disabledAt: disabledAccountData.disabledAt.toISOString(),
        reason: disabledAccountData.reason
      }
    });

  } catch (error) {
    console.error('Error disabling account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
