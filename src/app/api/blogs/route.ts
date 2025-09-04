import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { verifyAuth } from '@/lib/auth';

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
  author: string;
  date: string;
  content: Section[];
  tags: string[];
  category: string;
  slug: string;
  image: string | null;
  publicId: string | null; // Added for banner image
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid page or limit' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION);

    const totalBlogs = await blogsCollection.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await blogsCollection
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        blogs: blogs.map((blog) => ({
          _id: blog._id.toString(),
          title: blog.title,
          author: blog.author,
          date: blog.date,
          content: blog.content, // Now supports Section[] or string
          tags: blog.tags,
          category: blog.category,
          slug: blog.slug,
          image: blog.image,
          publicId: blog.publicId, // Added
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
        })),
        totalPages,
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch blogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      author,
      date,
      content,
      tags,
      category,
      slug,
      image,
      publicId,
    }: BlogData = await req.json();

    // Validation
    if (!title || !author || !date || !content || !category || !slug) {
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

    if (author !== user.userId) {
      return NextResponse.json({ error: 'You can only create blogs for yourself' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION);

    // Check if slug is unique
    const existingBlog = await blogsCollection.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 400 });
    }

    // Create blog object
    const blogData = {
      title,
      author,
      date: new Date(date),
      content, // Now Section[]
      tags: tags || [],
      category,
      slug,
      image: image || null,
      publicId: publicId || null, // Added
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert blog into database
    const result = await blogsCollection.insertOne(blogData);

    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }

    const insertedBlog = {
      _id: result.insertedId.toString(),
      ...blogData,
      date: blogData.date.toISOString(),
      createdAt: blogData.createdAt.toISOString(),
      updatedAt: blogData.updatedAt.toISOString(),
    };

    return NextResponse.json(insertedBlog, { status: 201 });
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}