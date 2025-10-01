import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { verifyAuth } from '@/lib/auth';
import { createMessage, checkUserExists } from '@/controllers/messageService';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    let imageUrl;
    if (image) {
      try {
        // Upload base64 image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'chat_images',
          resource_type: 'auto',
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return NextResponse.json({ message: 'Failed to upload image.' }, { status: 500 });
      }
    }

    // Create message using the service
    const savedMessage = await createMessage({
      senderId: authResult.userId,
      receiverId: receiverId,
      text: text,
      image: imageUrl,
    });

    // TODO: Implement Socket.io integration for real-time messaging
    // This would require setting up Socket.io server in Next.js
    // For now, we'll just return the message
    
    return NextResponse.json(savedMessage, { status: 201 });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
