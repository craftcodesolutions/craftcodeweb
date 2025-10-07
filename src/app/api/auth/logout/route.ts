import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/config/mongodb';
import { forceDisconnectUser } from '@/lib/socketServer';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const SESSIONS_COLLECTION = 'user_sessions';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('authToken')?.value;
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; email?: string } | null;
        userId = decoded?.userId ?? null;

        console.log(`🚪 User ${decoded?.email ?? 'unknown'} logging out (ID: ${userId})`);
        
        // Only call forceDisconnectUser if userId is a valid string
        if (userId) {
          forceDisconnectUser(userId, 'User logged out');
        } else {
          console.warn('⚠️ No valid userId found for socket disconnection');
        }
        
        try {
          const client = await clientPromise;
          const db = client.db(DB_NAME);
          const sessionsCollection = db.collection(SESSIONS_COLLECTION);
          
          const result = await sessionsCollection.updateMany(
            { userId: userId, isActive: true },
            { 
              $set: { 
                isActive: false, 
                updatedAt: new Date(),
                logoutAt: new Date()
              } 
            }
          );
          
          console.log(`Deactivated ${result.modifiedCount} sessions for user ${userId || 'unknown'}`);
        } catch (dbError) {
          console.error('Failed to deactivate sessions:', dbError);
        }
        
      } catch (jwtError) {
        console.error('JWT verification failed during logout:', jwtError);
      }
    }

    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('userEmail', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    console.log(`✅ Logout completed for user ${userId || 'unknown'} - all sessions deactivated and sockets disconnected`);
    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}