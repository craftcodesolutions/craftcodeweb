import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'reviews';

export async function PATCH(req: NextRequest) {
  try {
    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // last segment

    if (!id) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    const { field, value } = await req.json();

    if (field !== 'status' || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid field or value' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const reviewsCollection = db.collection(COLLECTION);

    const result = await reviewsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: value } },
      { returnDocument: 'after' }
    );

    // ✅ Check if updated document exists
    if (!result || !result.value) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(
      { ...result.value, _id: result.value._id.toString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
