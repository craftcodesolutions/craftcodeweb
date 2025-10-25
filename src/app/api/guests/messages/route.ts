import { NextRequest, NextResponse } from 'next/server';
import { getGuestUserById, insertGuestMessage, getGuestMessages } from '@/controllers/guestUserService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'b7Kq9rL8x2N5fG4vD1sZ3uP6wT0yH8mX';

// GET /api/guests/messages - Get guest messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get('guestToken');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!guestToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'guestToken is required' 
      }, { status: 400 });
    }

    // Verify guest token
    let guestId: string;
    try {
      const decoded = jwt.verify(guestToken, JWT_SECRET) as { guestId: string };
      guestId = decoded.guestId;
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid guest token' 
      }, { status: 401 });
    }

    // Verify guest exists and is not expired
    const guestUser = await getGuestUserById(guestId);
    if (!guestUser || new Date(guestUser.expiresAt) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Guest user expired or not found' 
      }, { status: 410 });
    }

    const messages = await getGuestMessages(guestId, limit);

    return NextResponse.json({ 
      success: true, 
      data: messages 
    });

  } catch (error) {
    console.error('Error in guest message GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST /api/guests/messages - Send a guest message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestToken, message, chatId, image } = body;

    if (!guestToken || (!message && !image)) {
      return NextResponse.json({ 
        success: false, 
        error: 'guestToken and either message or image are required' 
      }, { status: 400 });
    }

    // Verify guest token
    let guestId: string;
    try {
      const decoded = jwt.verify(guestToken, JWT_SECRET) as { guestId: string };
      guestId = decoded.guestId;
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid guest token' 
      }, { status: 401 });
    }

    // Verify guest exists and is not expired
    const guestUser = await getGuestUserById(guestId);
    if (!guestUser || new Date(guestUser.expiresAt) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Guest user expired or not found' 
      }, { status: 410 });
    }

    // Save message to database
    const messageData = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      guestId,
      guestName: guestUser.dummyName,
      message: message || '',
      image: image || undefined,
      chatId: chatId || 'support_chat',
      type: 'guest_message' as const
    };

    await insertGuestMessage(messageData);

    return NextResponse.json({ 
      success: true, 
      data: messageData,
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Error in guest message POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}