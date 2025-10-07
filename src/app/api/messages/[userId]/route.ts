import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';
import { createMessage, checkUserExists, getMessagesByUserId, Message } from '@/controllers/messageService';
import { v2 as cloudinary } from 'cloudinary';
import { sendToUser, getSocketIO } from '@/lib/socketServer';

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
    const { userId: otherUserId } = await params;

    if (!ObjectId.isValid(otherUserId)) {
      return NextResponse.json({ message: 'Invalid user ID.' }, { status: 400 });
    }

    // Check if other user exists
    const userExists = await checkUserExists(otherUserId);
    if (!userExists) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Fetch messages
    const messages = await getMessagesByUserId(authResult.userId, otherUserId);
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error in getMessages:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const client = new MongoClient(MONGODB_URI);
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId: receiverId } = await params;

    // Parse request body
    const { text, image } = await request.json();

    // Validation
    if (!text && !image) {
      return NextResponse.json({ message: 'Text or image is required.' }, { status: 400 });
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

    // Check for duplicate message
    await client.connect();
    const db = client.db(DB_NAME);
    const messagesCollection = db.collection('messages');
    const existingMessage = await messagesCollection.findOne({
      senderId: new ObjectId(authResult.userId),
      receiverId: new ObjectId(receiverId),
      text: text || undefined,
      image: image ? undefined : { $exists: false },
      createdAt: { $gte: new Date(Date.now() - 5000) },
    });

    if (existingMessage) {
      console.warn('Duplicate message detected:', {
        messageId: existingMessage._id.toString(),
        text: text?.substring(0, 50),
        senderId: authResult.userId,
        receiverId,
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
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'chat_images',
          resource_type: 'auto',
        });
        imageUrl = uploadResponse.secure_url;

        const imageDuplicate = await messagesCollection.findOne({
          senderId: new ObjectId(authResult.userId),
          receiverId: new ObjectId(receiverId),
          image: imageUrl,
          createdAt: { $gte: new Date(Date.now() - 5000) },
        });

        if (imageDuplicate) {
          console.warn('Duplicate image message detected:', {
            messageId: imageDuplicate._id.toString(),
            senderId: authResult.userId,
            receiverId,
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
      senderId: authResult.userId,
      receiverId: receiverId,
      text,
      image: imageUrl,
    });

    // Real-time Socket.IO integration
    let io = getSocketIO();
    
    if (!io) {
      console.warn('⚠️ Socket.IO server not initialized, attempting to initialize...');
      try {
        const initResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket`);
        if (initResponse.ok) {
          console.log('✅ Socket.IO server initialization attempted');
          io = getSocketIO();
        }
      } catch (error) {
        console.error('❌ Failed to initialize Socket.IO server:', error);
      }
    }
    
    if (io) {
      console.log(`🚀 Attempting to send real-time message from ${authResult.userId} to ${receiverId}`);
      
      const messageData: MessageResponse = {
        ...savedMessage,
        senderId: savedMessage.senderId.toString(),
        receiverId: savedMessage.receiverId.toString(),
        timestamp: new Date().toISOString(),
      };

      // Send real-time message to receiver
      sendToUser(receiverId, 'newMessage', { ...messageData });

      // Also send to sender for multi-device sync
      sendToUser(authResult.userId, 'messageSent', { ...messageData });

      console.log(`📨 Real-time message broadcasted: ${authResult.userId} -> ${receiverId}`);
      console.log('📋 Message data:', { 
        messageId: savedMessage._id, 
        text: savedMessage.text?.substring(0, 50) + '...',
        senderId: savedMessage.senderId.toString(),
        receiverId: savedMessage.receiverId.toString(),
      });
    } else {
      console.warn('⚠️ Socket.IO server still not available - message saved to database only');
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