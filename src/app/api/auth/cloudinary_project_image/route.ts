import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Please select a valid image file' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size should be less than 5MB' },
        { status: 400 }
      );
    }

    try {
      // Convert File to buffer
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'craftcode-projects',
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' }
            ],
            resource_type: 'image'
          },
          (error: unknown, result: CloudinaryUploadResult | undefined) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('No result returned from Cloudinary'));
          }
        ).end(buffer);
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Image uploaded successfully',
          imageUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        },
        { status: 200 }
      );

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image to Cloudinary' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: 'Failed to process image upload' },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to remove images from Cloudinary
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return NextResponse.json(
        {
          success: true,
          message: 'Image deleted successfully'
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 