import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';
import { createMessage, checkUserExists, Message } from '@/controllers/messageService';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'CraftCode';

// Interface for response to allow string IDs
interface MessageResponse {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  timestamp?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const client = new MongoClient(MONGODB_URI);
  try {
    console.log('📤 POST /api/messages/send/[userId] called');

    // Parse request body and path param
    const body = await request.json().catch(() => ({}));
    const { text, image } = body || {};
    const paramsObj = await params;
    const receiverId = paramsObj?.userId;

    console.log('🔍 Message context:', { receiverId, hasText: !!text, hasImage: !!image });

    // Handle authenticated user messages
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validation
    if (!text && !image) {
      return NextResponse.json({ message: 'Text or image is required.' }, { status: 400 });
    }

    if (!receiverId) {
      return NextResponse.json({ message: 'Receiver ID is required.' }, { status: 400 });
    }

    if (!ObjectId.isValid(receiverId)) {
      return NextResponse.json({ message: 'Invalid receiver ID.' }, { status: 400 });
    }

    if (authResult.userId === receiverId) {
      return NextResponse.json({ message: 'Cannot send messages to yourself.' }, { status: 400 });
    }

    // Check if receiver exists
    const receiverExists = await checkUserExists(receiverId);
    if (!receiverExists) {
      return NextResponse.json({ message: 'Receiver not found.' }, { status: 404 });
    }

    // Ensure IDs are stored as ObjectId in the database
    const senderId = new ObjectId(authResult.userId);
    const receiverObjectId = new ObjectId(receiverId);

    // Check for duplicate message
    await client.connect();
    const db = client.db(DB_NAME);
    const messagesCollection = db.collection('messages');
    const existingMessage = await messagesCollection.findOne({
      senderId,
      receiverId: receiverObjectId,
      text: text || undefined,
      image: image ? undefined : { $exists: false },
      createdAt: { $gte: new Date(Date.now() - 5000) },
    });

    if (existingMessage) {
      console.warn('Duplicate message detected:', {
        messageId: existingMessage._id.toString(),
        text: text?.substring(0, 50),
        senderId: senderId.toString(),
        receiverId: receiverObjectId.toString(),
      });
      return NextResponse.json({
        ...existingMessage,
        _id: existingMessage._id.toString(),
        senderId: existingMessage.senderId.toString(),
        receiverId: existingMessage.receiverId.toString(),
      });
    }

    let imageUrl: string | undefined;
    if (image) {
      try {
        // Upload base64 image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'chat_images',
          resource_type: 'auto',
        });
        imageUrl = uploadResponse.secure_url;

        const imageDuplicate = await messagesCollection.findOne({
          senderId,
          receiverId: receiverObjectId,
          image: imageUrl,
          createdAt: { $gte: new Date(Date.now() - 5000) },
        });

        if (imageDuplicate) {
          console.warn('Duplicate image message detected:', {
            messageId: imageDuplicate._id.toString(),
            senderId: senderId.toString(),
            receiverId: receiverObjectId.toString(),
          });
          return NextResponse.json({
            ...imageDuplicate,
            _id: imageDuplicate._id.toString(),
            senderId: imageDuplicate.senderId.toString(),
            receiverId: imageDuplicate.receiverId.toString(),
          });
        }
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return NextResponse.json({ message: 'Failed to upload image.' }, { status: 500 });
      }
    }

    // Create message using the service

    const savedMessage: Message = await createMessage({
      senderId: senderId.toString(),
      receiverId: receiverObjectId.toString(),
      text,
      image: imageUrl,
    });

    // Real-time Socket.IO integration via HTTP endpoint
    const SOCKET_SERVER_URL = process.env.SOCKET_URL || 
      (process.env.NODE_ENV === 'development' ? 'http://localhost:3008' : 'https://server-wp4r.onrender.com');

    const messageData: MessageResponse = {
      ...savedMessage,
      senderId: savedMessage.senderId.toString(),
      receiverId: savedMessage.receiverId.toString(),
      timestamp: new Date().toISOString(),
    };

    try {
      console.log(`🚀 Sending real-time message from ${senderId.toString()} to ${receiverObjectId.toString()}`);
      
      // Send real-time message to receiver
      await fetch(`${SOCKET_SERVER_URL}/emit-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: receiverObjectId.toString(), 
          event: 'newMessage', 
          data: messageData 
        })
      });

      // Also send to sender for multi-device sync
      await fetch(`${SOCKET_SERVER_URL}/emit-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: senderId.toString(), 
          event: 'messageSent', 
          data: messageData 
        })
      });

      console.log(`📨 Real-time message broadcasted: ${senderId.toString()} -> ${receiverObjectId.toString()}`);
      console.log('📋 Message data:', { 
        messageId: savedMessage._id, 
        text: savedMessage.text?.substring(0, 50) + '...',
        senderId: savedMessage.senderId.toString(),
        receiverId: savedMessage.receiverId.toString(),
      });
    } catch (socketError) {
      console.warn('⚠️ Socket.IO server not available - message saved to database only:', socketError);
    }
    
    return NextResponse.json({
      ...savedMessage,
      senderId: savedMessage.senderId.toString(),
      receiverId: savedMessage.receiverId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error in sendMessage:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
