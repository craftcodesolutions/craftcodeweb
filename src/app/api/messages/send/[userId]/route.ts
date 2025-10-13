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
  let client: MongoClient | null = null;
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId: receiverId } = await params;

    // Validate receiverId
    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }
    if (!ObjectId.isValid(receiverId)) {
      return NextResponse.json({ error: 'Invalid receiver ID format' }, { status: 400 });
    }
    if (authResult.userId === receiverId) {
      return NextResponse.json({ error: 'Cannot send messages to yourself' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { text, image } = body;

    // Validate payload
    if (!text && !image) {
      return NextResponse.json({ error: 'Text or image is required' }, { status: 400 });
    }

    // Initialize MongoDB client
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // Check if receiver exists
    const receiverExists = await checkUserExists(receiverId);
    if (!receiverExists) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Check for duplicate message
    const messagesCollection = db.collection('messages');
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const existingMessage = await messagesCollection.findOne({
      senderId: new ObjectId(authResult.userId),
      receiverId: new ObjectId(receiverId),
      text: text || undefined,
      image: image ? undefined : { $exists: false },
      createdAt: { $gte: fiveSecondsAgo },
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
      }, { status: 200 });
    }

    let imageUrl: string | undefined;
    if (image) {
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
          }, { status: 200 });
        }
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', {
          error: uploadError instanceof Error ? uploadError.message : String(uploadError),
          stack: uploadError instanceof Error ? uploadError.stack : undefined,
        });
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    // Create message using the service
    const savedMessage: Message = await createMessage({
      senderId: authResult.userId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Real-time Socket.IO integration
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
          console.warn('Failed to initialize Socket.IO server:', initResponse.status);
        }
      } catch (error) {
        console.error('Failed to initialize Socket.IO server:', {
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

      // Send real-time message to receiver and sender
      sendToUser(receiverId, 'newMessage', { ...messageData });
      sendToUser(authResult.userId, 'messageSent', { ...messageData });

      console.log('Real-time message broadcasted:', {
        messageId: savedMessage._id,
        text: savedMessage.text?.substring(0, 50),
        senderId: savedMessage.senderId.toString(),
        receiverId: savedMessage.receiverId.toString(),
      });
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
    console.error('Error in sendMessage:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      userId: (await params).userId,
      authUserId: (await verifyAuth(request)).userId,
    });
    return NextResponse.json({ error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  } finally {
    if (client) {
      await client.close().catch((err) => console.error('Error closing MongoDB client:', err));
    }
  }
}