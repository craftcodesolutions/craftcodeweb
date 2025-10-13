import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/config/mongodb';
import { forceDisconnectUser } from '@/lib/socketServer';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = 'CraftCode';
const SESSIONS_COLLECTION = 'user_sessions';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) return clearCookies();

    let userId: string | null = null;
    let userEmail: string | null = null;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; email?: string };
      userId = decoded?.userId ?? null;
      userEmail = decoded?.email ?? null;

      console.log(`🚪 [${new Date().toISOString()}] Logging out user ${userEmail ?? 'unknown'} (ID: ${userId})`);

      if (userId) {
        forceDisconnectUser(userId, 'User logged out');

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const sessionsCollection = db.collection(SESSIONS_COLLECTION);

        const result = await sessionsCollection.updateMany(
          { userId, isActive: true },
          { $set: { isActive: false, updatedAt: new Date(), logoutAt: new Date() } }
        );
        console.log(`Deactivated ${result.modifiedCount} session(s) for user ${userEmail ?? 'unknown'}`);
      }
    } catch (jwtError) {
      console.error(`❌ [${new Date().toISOString()}] JWT verification failed during logout: ${jwtError}`);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    return clearCookies();
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Logout error: ${error}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function clearCookies() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });
  response.cookies.set('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  response.cookies.set('userEmail', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  console.log(`✅ [${new Date().toISOString()}] Cookies cleared (authToken, userEmail)`);
  return response;
}