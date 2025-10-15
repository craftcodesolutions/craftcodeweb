/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { verifyAuth } from '@/lib/auth';
import { getChatPartners } from '@/controllers/messageService';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'CraftCode';

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize MongoDB client
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();

    // Get chat partners using the service
    const chatPartners = await getChatPartners(authResult.userId);

    return NextResponse.json(
      chatPartners.map(partner => ({
        ...partner,
        _id: partner._id.toString(),
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/messages/chats:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to fetch chat partners', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close().catch((err) => console.error('Error closing MongoDB client:', err));
    }
  }
}