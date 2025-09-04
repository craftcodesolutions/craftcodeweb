import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'blogs';

interface Section {
  id: number;
  type: 'text' | 'image';
  content: string;
  publicId?: string | null;
}

interface BlogData {
  title: string;
  content: Section[];
  tags: string[];
  category: string;
  slug: string;
  image: string | null;
  publicId: string | null; // Added for banner image
}

interface RouteParams<T extends string> {
  params: Promise<Record<T, string>>;
}

export async function PUT(req: NextRequest, { params }: RouteParams<'id'>) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const {
      title,
      content,
      tags,
      category,
      slug,
      image,
      publicId,
    }: BlogData = await req.json();

    // Basic validation
    if (!title || !content || !category || !slug) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }
    if (title.length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters long' }, { status: 400 });
    }
    if (!Array.isArray(content) || content.length === 0) {
      return NextResponse.json({ error: 'Content must be a non-empty array of sections' }, { status: 400 });
    }
    for (const section of content) {
      if (!section.id || !section.type || !['text', 'image'].includes(section.type)) {
        return NextResponse.json({ error: 'Each section must have a valid id and type (text or image)' }, { status: 400 });
      }
      if (section.type === 'text' && section.content.length < 10) {
        return NextResponse.json({ error: 'Text section content must be at least 10 characters long' }, { status: 400 });
      }
      if (section.type === 'image' && !section.content) {
        return NextResponse.json({ error: 'Image section must have a valid content URL' }, { status: 400 });
      }
    }
    if (!['Technology', 'Design', 'Development', 'UI/UX', 'Other'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION);

    // Find blog
    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Authorization check
    const userId = req.headers.get('x-user-id');
    if (!userId || blog.author !== userId) {
      return NextResponse.json({ error: 'You are not authorized to update this blog' }, { status: 403 });
    }

    // Ensure slug is unique
    const existingBlog = await blogsCollection.findOne({
      slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (existingBlog) {
      return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 400 });
    }

    // Build updated blog
    const updatedBlog = {
      title,
      author: blog.author,
      date: blog.date, // Keep original publish date
      content, // Now Section[]
      tags: tags || [],
      category,
      slug,
      image: image || null,
      publicId: publicId || null, // Added
      updatedAt: new Date(),
    };

    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedBlog }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }

    return NextResponse.json(
      { _id: id, ...updatedBlog, createdAt: blog.createdAt, date: blog.date.toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams<'id'>) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION);

    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Authorization check
    const userId = req.headers.get('x-user-id');
    if (blog.author !== userId) {
      return NextResponse.json({ error: 'You are not authorized to delete this blog' }, { status: 403 });
    }

    // Delete images from Cloudinary if they exist
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Delete banner image
    if (blog.publicId) {
      try {
        await cloudinary.uploader.destroy(blog.publicId);
      } catch (err) {
        console.error('Cloudinary banner image delete failed:', err);
      }
    }

    // Delete section images
    if (Array.isArray(blog.content)) {
      const imageSections = blog.content.filter((section: Section) => section.type === 'image' && section.publicId);
      for (const section of imageSections) {
        try {
          await cloudinary.uploader.destroy(section.publicId);
        } catch (err) {
          console.error(`Cloudinary section image delete failed for publicId ${section.publicId}:`, err);
        }
      }
    }

    // Delete blog
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Blog deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}