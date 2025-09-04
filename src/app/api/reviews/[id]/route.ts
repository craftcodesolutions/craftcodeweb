/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'reviews';

// PATCH handler for /api/reviews/[id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  let id: string | undefined; // Declare id outside try-catch for scope
  try {
    const params = await context.params; // Await the params Promise
    ({ id } = params); // Assign id from resolved params
    console.log(id);

    // Validate id
    if (!id || !ObjectId.isValid(id)) {
      console.log(`Invalid id: ${id}`);
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { field, value } = body;

    console.log(`PATCH request received for id: ${id}, body: ${JSON.stringify(body)}`);

    if (field !== 'status' || typeof value !== 'boolean') {
      console.log(`Invalid field or value: field=${field}, value=${value}`);
      return NextResponse.json(
        { error: 'Invalid field or value: field must be "status" and value must be a boolean' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const submissionsCollection = db.collection(COLLECTION);

    // Update the review's status
    const result = await submissionsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: value } },
      { returnDocument: 'after' } // Return the updated document
    );

    // Check if the review exists
    if (!result) {
      console.log(`Review not found for ID: ${id}`);
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Format the updated review with _id as string
    const updatedReview = {
      ...result,
      _id: result._id.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Review status updated successfully',
        review: updatedReview,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Update review error for id=${id || 'unknown'}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}