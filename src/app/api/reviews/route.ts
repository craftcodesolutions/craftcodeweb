/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'reviews';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const search = searchParams.get('search') || '';

    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid page or limit parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const submissionsCollection = db.collection(COLLECTION);

    // Build query for search
    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    // Get total count for pagination
    const totalReviews = await submissionsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limit);

    // Fetch reviews with pagination and search
    const reviews = await submissionsCollection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Format reviews with _id as string
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
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message, rating, termsAccepted, debug } = await req.json();

    // If debug is true, return the payload for inspection and skip DB logic
    if (debug && email) {
      return NextResponse.json({
        debug: true,
        received: { name, email, phone, subject, message, rating, termsAccepted }
      }, { status: 200 });
    }

    // Validation
    if (!name || typeof name !== 'string' || name.length > 100) {
      return NextResponse.json({ error: 'Name is required and must be less than 100 characters' }, { status: 400 });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || email.length > 100) {
      return NextResponse.json({ error: 'Valid email is required and must be less than 100 characters' }, { status: 400 });
    }
    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return NextResponse.json({ error: 'Phone must be less than 20 characters' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string' || subject.length > 200) {
      return NextResponse.json({ error: 'Subject is required and must be less than 200 characters' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.length > 5000) {
      return NextResponse.json({ error: 'Message is required and must be less than 5000 characters' }, { status: 400 });
    }
    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }
    if (!termsAccepted || typeof termsAccepted !== 'boolean') {
      return NextResponse.json({ error: 'Terms acceptance is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const submissionsCollection = db.collection(COLLECTION);

    // Check if user has already submitted using email
    const existingSubmission = await submissionsCollection.findOne({ email: email.toLowerCase() });
    if (existingSubmission) {
      return NextResponse.json({ error: 'User with this email has already submitted a support request' }, { status: 400 });
    }

    // Create submission object
    const submissionData = {
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      subject,
      message,
      rating,
      createdAt: new Date(),
    };

    // Insert submission into database
    const result = await submissionsCollection.insertOne(submissionData);

    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to submit support request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Support request submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Support submission error:', error);
    return NextResponse.json({ error: 'Failed to submit support request' }, { status: 500 });
  }
}
