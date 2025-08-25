/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/config/mongodb";
import { ObjectId } from "mongodb";

// 🔑 Correct type
type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params; // ✅ must await
    console.log("[DEBUG] Received slug:", slug);

    if (!slug) {
      console.warn("[DEBUG] No slug provided");
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "CraftCode");

    console.log("[DEBUG] Fetching blog from DB...");
    const blog = await db.collection("blogs").findOne({ slug });
    if (!blog) {
      console.warn("[DEBUG] Blog not found for slug:", slug);
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    console.log("[DEBUG] Blog found:", blog);

    // Build author data
    let authorData = {
      userId: blog.author?.toString() || "",
      firstName: "Unknown",
      lastName: "User",
      avatar: "",
    };

    if (blog.author) {
      console.log("[DEBUG] Fetching author data for ID:", blog.author);
      let authorQuery;
      try {
        authorQuery = ObjectId.isValid(blog.author)
          ? { _id: new ObjectId(blog.author) }
          : { _id: blog.author };
      } catch {
        authorQuery = { _id: blog.author };
      }

      const user = await db.collection("users").findOne(authorQuery);
      if (user) {
        authorData = {
          userId: user._id.toString(),
          firstName: user.firstName || "Unknown",
          lastName: user.lastName || "User",
          avatar: user.profileImage || "",
        };
        console.log("[DEBUG] Author data fetched:", authorData);
      } else {
        console.warn(
          "[DEBUG] Author not found in users collection for:",
          blog.author
        );
      }
    } else {
      console.warn("[DEBUG] Blog does not have an author field");
    }

    // Final response
    const response = {
      _id: blog._id.toString(),
      slug: blog.slug,
      title: blog.title || "Untitled",
      content: blog.content || "",
      image: blog.image || "",
      author: authorData,
      date: blog.date || new Date().toISOString(),
      tags: blog.tags || [],
      category: blog.category || "General",
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };

    console.log("[DEBUG] Final API response:", response);
    return NextResponse.json(response);
  } catch (err: any) {
    console.error("GET /api/blogs/[slug] error:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
