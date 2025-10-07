import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const SESSIONS_COLLECTION = 'user_sessions';

interface SessionData {
  userId: string;
  deviceId: string;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Generate device ID from user agent and IP
function generateDeviceId(userAgent: string, ipAddress: string): string {
  return createHash('sha256').update(`${userAgent}-${ipAddress}`).digest('hex').substring(0, 16);
}

// Create or update session
export async function POST(req: NextRequest) {
  try {
    const { userId, token, userAgent, ipAddress } = await req.json();

    if (!userId || !token) {
      return NextResponse.json({ error: 'UserId and token are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);

    // Generate device ID
    const deviceId = generateDeviceId(userAgent || 'unknown', ipAddress || 'unknown');

    // Verify JWT token
    let decodedToken: { exp?: number } | null = null;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as { exp?: number } | null;
    } catch (err) {
      console.error('Invalid token during session POST:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create session data
    const sessionData: SessionData = {
      userId,
      deviceId,
      token,
      userAgent: userAgent || 'unknown',
      ipAddress: ipAddress || 'unknown',
  expiresAt: decodedToken && decodedToken.exp ? new Date(decodedToken.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Convert JWT exp to Date
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // Upsert session (update if exists, create if not)
    const result = await sessionsCollection.findOneAndUpdate(
      { userId, deviceId },
      {
        $set: {
          ...sessionData,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );

    return NextResponse.json({ 
      success: true, 
      sessionId: result?._id?.toString() || 'unknown',
      message: 'Session created/updated successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// Get user sessions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const deviceId = searchParams.get('deviceId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);

    // Build query
    const query: Record<string, unknown> = { userId };
    if (deviceId) {
      (query as Record<string, unknown>)['deviceId'] = deviceId;
    }
    if (activeOnly) {
      (query as Record<string, unknown>)['isActive'] = true;
      (query as Record<string, unknown>)['expiresAt'] = { $gt: new Date() } as unknown;
    }

    const sessions = await sessionsCollection
      .find(query, {
        projection: {
          token: 0, // Don't return tokens in GET requests for security
        },
      })
      .sort({ updatedAt: -1 })
      .toArray();

    const formattedSessions = sessions.map(session => ({
      ...session,
      _id: session._id.toString(),
    }));

    return NextResponse.json({ sessions: formattedSessions }, { status: 200 });

  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// Update sessions (for token regeneration)
export async function PATCH(req: NextRequest) {
  try {
    const { userId, newToken, deviceId } = await req.json();

    if (!userId || !newToken) {
      return NextResponse.json({ error: 'UserId and newToken are required' }, { status: 400 });
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Verify new JWT token
    let decodedToken: { exp?: number } | null = null;
    try {
      decodedToken = jwt.verify(newToken, JWT_SECRET) as { exp?: number } | null;
    } catch (err) {
      console.error('Invalid new token during session PATCH:', err);
      return NextResponse.json({ error: 'Invalid new token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);

    // Build update query
    const query: Record<string, unknown> = { userId, isActive: true };
    if (deviceId) {
      (query as Record<string, unknown>)['deviceId'] = deviceId;
    }

    // Update all active sessions for the user (or specific device)
    const expiresAt = decodedToken && decodedToken.exp ? new Date(decodedToken.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updateResult = await sessionsCollection.updateMany(
      query,
      {
        $set: {
          token: newToken,
          expiresAt,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      updatedSessions: updateResult.modifiedCount,
      message: 'Sessions updated successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json({ error: 'Failed to update sessions' }, { status: 500 });
  }
}

// Delete sessions (logout)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const deviceId = searchParams.get('deviceId');
    const allDevices = searchParams.get('allDevices') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);

  let query: Record<string, unknown> = { userId };
    
    if (allDevices) {
      // Logout from all devices
  query = { userId };
    } else if (deviceId) {
      // Logout from specific device
      query = { userId, deviceId };
    } else {
      return NextResponse.json({ error: 'DeviceId is required unless allDevices is true' }, { status: 400 });
    }

    // Mark sessions as inactive instead of deleting (for audit purposes)
    const result = await sessionsCollection.updateMany(
      query,
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      deactivatedSessions: result.modifiedCount,
      message: 'Sessions deactivated successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json({ error: 'Failed to deactivate sessions' }, { status: 500 });
  }
}
