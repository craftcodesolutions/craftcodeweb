/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'reviews';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const search = searchParams.get("search") || "";
    const statusParam = searchParams.get("status"); // status query param

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Invalid page or limit parameters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const submissionsCollection = db.collection(COLLECTION);

    // Build query
    const query: any = {};

    // Status filter (only true/false if provided)
    if (statusParam !== null) {
      query.status = statusParam === "true"; 
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { userType: searchRegex },
        { rankAndPosition: searchRegex },
      ];
    }

    // Total count for pagination
    const totalReviews = await submissionsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limit);

    // Fetch with pagination
    const reviews = await submissionsCollection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }) // newest first
      .toArray();

    // Convert ObjectId
    const formattedReviews = reviews.map((review) => ({
      ...review,
      _id: review._id.toString(),
    }));

    return NextResponse.json(
      {
        reviews: formattedReviews,
        totalPages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      rating,
      termsAccepted,
      image,
      publicId,
      userType,
      userId,
      rankAndPosition,
      debug,
    } = await req.json();

    // If debug is true, return the payload for inspection and skip DB logic
    if (debug && email) {
      return NextResponse.json(
        {
          debug: true,
          received: {
            name,
            email,
            phone,
            subject,
            message,
            rating,
            termsAccepted,
            image,
            publicId,
            userType,
            userId,
            rankAndPosition,
          },
        },
        { status: 200 }
      );
    }

    // Validation
    if (!name || typeof name !== 'string' || name.length > 100) {
      return NextResponse.json(
        { error: 'Name is required and must be less than 100 characters' },
        { status: 400 }
      );
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || email.length > 100) {
      return NextResponse.json(
        { error: 'Valid email is required and must be less than 100 characters' },
        { status: 400 }
      );
    }
    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return NextResponse.json(
        { error: 'Phone must be less than 20 characters' },
        { status: 400 }
      );
    }
    if (!subject || typeof subject !== 'string' || subject.length > 200) {
      return NextResponse.json(
        { error: 'Subject is required and must be less than 200 characters' },
        { status: 400 }
      );
    }
    if (!message || typeof message !== 'string' || message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is required and must be less than 5000 characters' },
        { status: 400 }
      );
    }
    if (
      typeof rating !== 'number' ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }
    if (!termsAccepted || typeof termsAccepted !== 'boolean') {
      return NextResponse.json(
        { error: 'Terms acceptance is required' },
        { status: 400 }
      );
    }
    if (!['General', 'Client'].includes(userType)) {
      return NextResponse.json(
        { error: 'User type must be either General or Client' },
        { status: 400 }
      );
    }
    if (userType === 'Client' && (!userId || typeof userId !== 'string')) {
      return NextResponse.json(
        { error: 'A valid User ID is required for Client submissions' },
        { status: 400 }
      );
    }
    if (userType === 'Client' && (!rankAndPosition || typeof rankAndPosition !== 'string' || rankAndPosition.length > 100)) {
      return NextResponse.json(
        { error: 'Rank and company position is required for Client and must be less than 100 characters' },
        { status: 400 }
      );
    }
    if (image && typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Image must be a valid URL string or null' },
        { status: 400 }
      );
    }
    if (publicId && typeof publicId !== 'string') {
      return NextResponse.json(
        { error: 'Public ID must be a valid string or null' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const submissionsCollection = db.collection(COLLECTION);

    // Create submission object
    const submissionData = {
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      subject,
      message,
      rating,
      termsAccepted,
      image: image || null,
      publicId: publicId || null,
      userType,
      userId: userType === 'Client' ? userId : null,
      rankAndPosition: userType === 'Client' ? rankAndPosition : '',
      createdAt: new Date(),
    };

    // Insert submission into database
    const result = await submissionsCollection.insertOne(submissionData);

    if (!result.insertedId) {
      return NextResponse.json(
        { error: 'Failed to submit support request' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Support request submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Support submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit support request' },
      { status: 500 }
    );
  }
}