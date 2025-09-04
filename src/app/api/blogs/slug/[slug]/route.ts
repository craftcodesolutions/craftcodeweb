import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/config/mongodb";

const DB_NAME = "CraftCode";
const COLLECTION = "blogs";

interface Section {
  id: number;
  type: "text" | "image";
  content: string;
  publicId?: string | null;
}

interface BlogResponse {
  _id: string;
  title: string;
  author: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  content: Section[];
  tags: string[];
  category: string;
  slug: string;
  image: string | null;
  publicId: string | null;
}

interface RouteParams<T extends string> {
  params: Promise<Record<T, string>>;
}

export async function GET(req: NextRequest, { params }: RouteParams<"slug">) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Invalid slug" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const blogsCollection = db.collection(COLLECTION);

    const blog = await blogsCollection.findOne({ slug });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    // Convert ObjectId and Date to string-friendly response
    const response: BlogResponse = {
      _id: blog._id.toString(),
      title: blog.title,
      author: blog.author,
      date: blog.date?.toISOString?.() || blog.date,
      createdAt: blog.createdAt?.toISOString?.() || blog.createdAt,
      updatedAt: blog.updatedAt?.toISOString?.() || blog.updatedAt,
      content: Array.isArray(blog.content) ? blog.content : [],
      tags: blog.tags || [],
      category: blog.category,
      slug: blog.slug,
      image: blog.image || null,
      publicId: blog.publicId || null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Get blog by slug error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
