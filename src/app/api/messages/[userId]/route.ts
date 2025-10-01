import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';
import { getMessagesByUserId } from '@/controllers/messageService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { userId: userToChatId } = await params;

    // Validate userToChatId
    if (!ObjectId.isValid(userToChatId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get messages using the service
    const messages = await getMessagesByUserId(authResult.userId, userToChatId);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error in GET /api/messages/[userId]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
