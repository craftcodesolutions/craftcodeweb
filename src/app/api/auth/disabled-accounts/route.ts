import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const DISABLED_ACCOUNTS_COLLECTION = 'disabled_accounts';

interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export async function GET(req: NextRequest) {
  try {
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

    // Only allow admins to view all disabled accounts
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const disabledAccountsCollection = db.collection(DISABLED_ACCOUNTS_COLLECTION);

    // Get all disabled accounts
    const disabledAccounts = await disabledAccountsCollection
      .find({})
      .sort({ disabledAt: -1 })
      .toArray();

    // Format the response
    const formattedAccounts = disabledAccounts.map(account => ({
      userId: account.userId,
      email: account.email,
      disabledAt: account.disabledAt.toISOString(),
      reason: account.reason || 'No reason provided',
      disabledBy: account.disabledBy
    }));

    return NextResponse.json({ 
      success: true, 
      disabledAccounts: formattedAccounts,
      count: formattedAccounts.length
    });

  } catch (error) {
    console.error('Error fetching disabled accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
