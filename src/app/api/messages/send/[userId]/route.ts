/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';
import { createMessage, checkUserExists, Message } from '@/controllers/messageService';
import { getGuestUserById, insertGuestMessage } from '@/controllers/guestUserService';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'b7Kq9rL8x2N5fG4vD1sZ3uP6wT0yH8mX';

console.log('🔑 JWT_SECRET configured:', JWT_SECRET ? 'Yes' : 'No');
console.log('🔑 JWT_SECRET value (first 10 chars):', JWT_SECRET.substring(0, 10));
// Remove client-side Socket.IO imports - we'll use HTTP requests to the Socket.IO server

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

    // Parse request body
    const { text, image, receiverId, senderId: incomingSenderId } = await request.json();
    console.log('🔍 Message context:', {
      receiverId,
      senderId: incomingSenderId
    });

    // Check if the message involves a guest user
    const isGuestMessage = receiverId.startsWith('guest_') || incomingSenderId.startsWith('guest_');
    console.log('🛠 Is guest message:', isGuestMessage);

    if (isGuestMessage) {
      console.log('🛠 Handling guest message logic...');

      // Validation for guest
      if (!text && !image) {
        return NextResponse.json({ 
          error: 'Text or image is required for guest messages' 
        }, { status: 400 });
      }

      // Initialize MongoDB client for duplicate checking
      await client.connect();
      const db = client.db(DB_NAME);
      const guestMessagesCollection = db.collection('guest_messages');

      // Check for duplicate text message
      if (text) {
        const existingTextMessage = await guestMessagesCollection.findOne({
          senderId: incomingSenderId,
          receiverId,
          message: text,
          timestamp: { $gte: new Date(Date.now() - 5000) }, // Within last 5 seconds
        });

        if (existingTextMessage) {
          console.warn('Duplicate guest text message detected:', {
            messageId: existingTextMessage.messageId,
            text: text.substring(0, 50),
            senderId: incomingSenderId,
            receiverId,
          });
          return NextResponse.json(existingTextMessage, { status: 200 });
        }
      }

      // Handle image upload for guest if present
      let imageUrl: string | undefined;
      if (image) {
        try {
          console.log('📷 Uploading guest image to Cloudinary...');
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: 'guest_chat_images',
            resource_type: 'auto',
          });
          imageUrl = uploadResponse.secure_url;
          console.log('✅ Guest image uploaded successfully:', imageUrl);

          // Check for duplicate image message
          const existingImageMessage = await guestMessagesCollection.findOne({
            senderId: incomingSenderId,
            receiverId,
            image: imageUrl,
            timestamp: { $gte: new Date(Date.now() - 5000) }, // Within last 5 seconds
          });

          if (existingImageMessage) {
            console.warn('Duplicate guest image message detected:', {
              messageId: existingImageMessage.messageId,
              senderId: incomingSenderId,
              receiverId,
              imageUrl,
            });
            return NextResponse.json(existingImageMessage, { status: 200 });
          }
        } catch (uploadError) {
          console.error('❌ Error uploading guest image to Cloudinary:', uploadError);
          return NextResponse.json({ 
            error: 'Failed to upload image' 
          }, { status: 500 });
        }
      }

      // Save guest message to database using insertGuestMessage
      const messageData = {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        guestId: receiverId.startsWith('guest_') ? receiverId : incomingSenderId, // Determine guestId
        guestName: receiverId.startsWith('guest_') ? 'Guest User' : 'Support Team',
        message: text || '',
        image: imageUrl,
        chatId: 'support_chat',
        type: 'guest_message' as const, // Explicitly set type to "guest_message"
        senderId: incomingSenderId,
      };

      const insertResult = await insertGuestMessage(messageData);
      console.log(`💾 Guest message insert result:`, insertResult);

      if (!insertResult.acknowledged) {
        console.error('❌ Failed to insert guest message into database');
        return NextResponse.json({ error: 'Failed to save guest message' }, { status: 500 });
      }

      console.log(`💾 Guest message saved to database`);

      // Emit to socket server for real-time
      const SOCKET_SERVER_URL = process.env.SOCKET_URL || 
        (process.env.NODE_ENV === 'development' ? 'http://localhost:3008' : 'https://server-wp4r.onrender.com');

      try {
        console.log(`🚀 Sending guest message to socket server`);

        await fetch(`${SOCKET_SERVER_URL}/emit-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: 'support_chat', 
            event: 'receiveGuestMessage', 
            data: {
              senderId: incomingSenderId,
              receiverId,
              text: text || '',
              image: imageUrl,
              timestamp: new Date().toISOString(),
              messageId: messageData.messageId
            }
          })
        });

        console.log(`📨 Guest message sent to socket successfully`);
      } catch (socketError) {
        console.warn('⚠️ Socket.IO server not available for guest message:', socketError);
      }

      console.log(`✅ Guest message processed successfully: ${text.substring(0, 50)}...`);
      return NextResponse.json(messageData, { status: 201 });
    }

    // Handle authenticated user messages (existing logic)
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
