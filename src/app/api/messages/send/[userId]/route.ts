import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';
import { createMessage, checkUserExists, Message } from '@/controllers/messageService';
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
  let client: MongoClient | null = null;
  try {
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      throw new Error('Server configuration error: JWT_SECRET is missing');
    }
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not set in environment variables');
      throw new Error('Server configuration error: MONGODB_URI is missing');
    }

    // Resolve params
    const { userId: receiverId } = await params;
    if (!receiverId) {
      console.error('Missing receiverId in params');
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    // Verify authentication
    console.log('Verifying authentication...', { receiverId });
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      console.error('Authentication failed', { userId: authResult.userId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate receiverId
    if (!ObjectId.isValid(receiverId)) {
      console.error('Invalid receiver ID format', { receiverId });
      return NextResponse.json({ error: 'Invalid receiver ID format' }, { status: 400 });
    }
    if (authResult.userId === receiverId) {
      console.error('Cannot send message to self', { userId: authResult.userId });
      return NextResponse.json({ error: 'Cannot send messages to yourself' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json().catch((err) => {
      console.error('Failed to parse request body', { error: err.message });
      throw new Error('Invalid request body');
    });
    const { text, image } = body;

    // Validate payload
    if (!text && !image) {
      console.error('Missing text or image in payload', { body });
      return NextResponse.json({ error: 'Text or image is required' }, { status: 400 });
    }

    // Initialize MongoDB client
    console.log('Connecting to MongoDB...', { receiverId });
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // Check if receiver exists
    console.log('Checking if receiver exists', { receiverId });
    const receiverExists = await checkUserExists(receiverId).catch((err) => {
      console.error('Error in checkUserExists', { error: err.message, stack: err.stack });
      throw new Error('Failed to verify receiver');
    });
    if (!receiverExists) {
      console.error('Receiver not found', { receiverId });
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Check for duplicate message
    const messagesCollection = db.collection('messages');
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    console.log('Checking for duplicate message', { senderId: authResult.userId, receiverId });
    const existingMessage = await messagesCollection.findOne({
      senderId: new ObjectId(authResult.userId),
      receiverId: new ObjectId(receiverId),
      text: text || undefined,
      image: image ? undefined : { $exists: false },
      createdAt: { $gte: fiveSecondsAgo },
    });

    if (existingMessage) {
      console.warn('Duplicate message detected', {
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
      }, { status: 200 });
    }

    let imageUrl: string | undefined;
    if (image) {
      console.log('Uploading image to Cloudinary', { receiverId });
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'chat_images',
          resource_type: 'auto',
        });
        imageUrl = uploadResponse.secure_url;

        // Check for duplicate image
        const imageDuplicate = await messagesCollection.findOne({
          senderId: new ObjectId(authResult.userId),
          receiverId: new ObjectId(receiverId),
          image: imageUrl,
          createdAt: { $gte: fiveSecondsAgo },
        });

        if (imageDuplicate) {
          console.warn('Duplicate image message detected', {
            messageId: imageDuplicate._id.toString(),
            senderId: authResult.userId,
            receiverId,
          });
          return NextResponse.json({
            ...imageDuplicate,
            _id: imageDuplicate._id.toString(),
            senderId: imageDuplicate.senderId.toString(),
            receiverId: imageDuplicate.receiverId.toString(),
          }, { status: 200 });
        }
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary', {
          error: uploadError instanceof Error ? uploadError.message : String(uploadError),
          stack: uploadError instanceof Error ? uploadError.stack : undefined,
        });
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    // Create message
    console.log('Creating message', { senderId: authResult.userId, receiverId, text, image: imageUrl });
    const savedMessage: Message = await createMessage({
      senderId: authResult.userId,
      receiverId,
      text,
      image: imageUrl,
    }).catch((err) => {
      console.error('Error in createMessage', { error: err.message, stack: err.stack });
      throw new Error('Failed to create message');
    });

    // Real-time Socket.IO integration
    console.log('Initializing Socket.IO', { receiverId });
    let io = getSocketIO();
    if (!io) {
      console.warn('Socket.IO server not initialized, attempting to initialize...');
      try {
        const initResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/socket`, {
          method: 'GET',
        });
        if (initResponse.ok) {
          console.log('Socket.IO server initialization attempted');
          io = getSocketIO();
        } else {
          console.warn('Failed to initialize Socket.IO server', { status: initResponse.status });
        }
      } catch (error) {
        console.error('Failed to initialize Socket.IO server', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    if (io) {
      const messageData: MessageResponse = {
        ...savedMessage,
        _id: savedMessage._id.toString(),
        senderId: savedMessage.senderId.toString(),
        receiverId: savedMessage.receiverId.toString(),
        timestamp: new Date().toISOString(),
      };

      console.log('Broadcasting real-time message', { messageId: savedMessage._id, senderId: authResult.userId, receiverId });
      sendToUser(receiverId, 'newMessage', { ...messageData });
      sendToUser(authResult.userId, 'messageSent', { ...messageData });
    } else {
      console.warn('Socket.IO server unavailable - message saved to database only');
    }

    // Return response
    return NextResponse.json({
      ...savedMessage,
      _id: savedMessage._id.toString(),
      senderId: savedMessage.senderId.toString(),
      receiverId: savedMessage.receiverId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error in sendMessage API', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      receiverId: (await params).userId,
      authUserId: (await verifyAuth(request).catch(() => ({ userId: null }))).userId,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close().catch((err) => console.error('Error closing MongoDB client', { error: err.message }));
    }
  }
}