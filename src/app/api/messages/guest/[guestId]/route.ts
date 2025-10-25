/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getGuestMessages, insertGuestMessage } from '@/controllers/guestUserService';
import { getSocketInstance } from '@/lib/socketServer';
import { Server as SocketIOServer } from 'socket.io';

export async function GET(
  request: NextRequest,
  context: { params: { guestId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guestId = await Promise.resolve(context.params.guestId);
    console.log(`📨 Fetching guest messages for guestId: ${guestId}`);

    // Fetch guest messages
    const messages = await getGuestMessages(guestId);

    // Subscribe the support team member to the guest's room for real-time updates
    const io = getSocketInstance();
    if (io) {
      // Join the support team member to the guest's room
      const supportSockets = Array.from(io.sockets.sockets.values())
        .filter(socket => socket.data.userId === authResult.userId);
      
      for (const socket of supportSockets) {
        socket.join(`guest_${guestId}`);
        console.log(`👥 Support member ${authResult.userId} joined guest room: guest_${guestId}`);
      }
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching guest messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { guestId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guestId = await Promise.resolve(context.params.guestId);

    const messageData = await request.json();
    console.log('📨 Creating guest message:', messageData);

    // Validate required fields
    if (!messageData.guestId || (!messageData.message && !messageData.image)) {
      return NextResponse.json(
        { error: 'Missing required fields (guestId and message/image)' },
        { status: 400 }
      );
    }

    // Prepare message data with current timestamp
    const now = new Date();
    
    // Insert the guest message
    const result = await insertGuestMessage({
      messageId: messageData.messageId,
      guestId: guestId, // Use the guestId from route params
      guestName: messageData.guestName || 'Support Team',
      message: messageData.message,
      image: messageData.image,
      chatId: messageData.chatId || `chat_${guestId}`,
      type: messageData.type || 'support_reply',
      senderId: messageData.senderId || authResult.userId
    });

    // Emit real-time message
    const io = getSocketInstance();
    if (io) {
      // Emit to the guest's room
      io.to(`guest_${guestId}`).emit('guestMessage', {
        ...result,
        type: messageData.type || 'support_reply',
        timestamp: new Date().toISOString()
      });

      // Emit to support team
      io.to('support_team').emit('guestMessage', {
        ...result,
        type: messageData.type || 'support_reply',
        timestamp: new Date().toISOString()
      });

      console.log(`📡 Emitted guest message to rooms: guest_${messageData.guestId} and support_team`);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating guest message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}