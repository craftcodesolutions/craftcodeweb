import { NextRequest, NextResponse } from 'next/server';
import { StreamClient } from '@stream-io/node-sdk';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import clientPromise from '@/config/mongodb';
import { MeetingQueryFilter } from './types';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const DB_NAME = 'CraftCode';
const COLLECTION = 'meetings';
const USERS_COLLECTION = 'users';

interface MeetingData {
  id: string;
  title?: string;
  description?: string;
  startsAt: string;
  participants: string[];
  createdBy: string;
  meetingType: 'instant' | 'scheduled';
  streamCallId: string;
}

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;

  if (!authToken) {
    throw new Error('No authentication token found');
  }

  let decoded: { userId: string; [key: string]: unknown };
  try {
    const result = jwt.verify(authToken, JWT_SECRET);
    if (typeof result === 'string') {
      throw new Error('Invalid token format');
    }
    decoded = result as { userId: string; [key: string]: unknown };
  } catch {
    throw new Error('Invalid or expired token');
  }

  return decoded.userId;
}

// Helper function to validate participants exist
async function validateParticipants(participantIds: string[]) {
  if (participantIds.length === 0) return [];

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const usersCollection = db.collection(USERS_COLLECTION);
  
  const { ObjectId } = await import('mongodb');
  const objectIds = participantIds.map(id => {
    try {
      return new ObjectId(id);
    } catch {
      return null;
    }
  }).filter((id): id is InstanceType<typeof ObjectId> => id !== null);

  const users = await usersCollection.find({
    _id: { $in: objectIds }
  }).toArray();

  return users.map(user => user._id.toString());
}

// Create a new meeting
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await req.json();
    
    const {
      title,
      description,
      startsAt,
      participants = [],
      meetingType = 'scheduled'
    } = body;

    // Validation
    if (!startsAt) {
      return NextResponse.json({ error: 'Start time is required' }, { status: 400 });
    }

    // Validate future date for scheduled meetings
    if (meetingType === 'scheduled') {
      const startDate = new Date(startsAt);
      if (startDate.getTime() <= Date.now()) {
        return NextResponse.json({ error: 'Scheduled meetings must be in the future' }, { status: 400 });
      }
    }

    // Validate participants
    const validParticipants = await validateParticipants(participants);
    
    // Always include creator in participants
    const allParticipants = [...new Set([userId, ...validParticipants])];

    // Check Stream API credentials
    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return NextResponse.json({ error: 'Stream configuration missing' }, { status: 500 });
    }

    // Create Stream call
    const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);
    const callId = crypto.randomUUID();
    
    try {
      const call = streamClient.video.call('default', callId);
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          created_by_id: userId,
          custom: {
            title: title || (meetingType === 'scheduled' ? 'Scheduled Meeting' : 'Instant Meeting'),
            description: description || '',
            participants: allParticipants,
            createdBy: userId,
            meetingType,
          },
        },
      });

      // Store meeting in database
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const meetingsCollection = db.collection(COLLECTION);

      const meetingData: MeetingData = {
        id: callId,
        title: title || (meetingType === 'scheduled' ? 'Scheduled Meeting' : 'Instant Meeting'),
        description: description || '',
        startsAt,
        participants: allParticipants,
        createdBy: userId,
        meetingType,
        streamCallId: callId,
      };

      await meetingsCollection.insertOne({
        ...meetingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        meeting: meetingData,
        meetingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/meeting-area/${callId}`,
      }, { status: 201 });

    } catch (streamError) {
      console.error('Stream API error:', streamError);
      return NextResponse.json({ error: 'Failed to create meeting call' }, { status: 500 });
    }

  } catch (error) {
    console.error('Meeting creation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}

// Get meetings for authenticated user
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'upcoming' | 'ended' | 'all'
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const meetingsCollection = db.collection(COLLECTION);

    // Build query to find meetings where user is participant or creator
    const query: MeetingQueryFilter = {
      $or: [
        { createdBy: userId },
        { participants: { $in: [userId] } }
      ]
    };

    // Add time-based filtering
    const now = new Date();
    if (type === 'upcoming') {
      query.startsAt = { $gt: now.toISOString() };
    } else if (type === 'ended') {
      query.startsAt = { $lt: now.toISOString() };
    }

    const meetings = await meetingsCollection
      .find(query)
      .sort({ startsAt: -1 })
      .toArray();

    // Format meetings for response
    const formattedMeetings = meetings.map(meeting => ({
      ...meeting,
      _id: meeting._id.toString(),
    }));

    return NextResponse.json({
      meetings: formattedMeetings,
      count: formattedMeetings.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Get meetings error:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

// Update meeting
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await req.json();
    
    const { meetingId, ...updateData } = body;

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const meetingsCollection = db.collection(COLLECTION);

    // Check if user has permission to update this meeting
    const meeting = await meetingsCollection.findOne({
      id: meetingId,
      $or: [
        { createdBy: userId },
        { participants: { $in: [userId] } }
      ]
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found or access denied' }, { status: 404 });
    }

    // Update meeting
    const result = await meetingsCollection.updateOne(
      { id: meetingId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Meeting updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Update meeting error:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

// Delete meeting
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('id');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const meetingsCollection = db.collection(COLLECTION);

    // Check if user is the creator (only creator can delete)
    const meeting = await meetingsCollection.findOne({
      id: meetingId,
      createdBy: userId
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found or access denied' }, { status: 404 });
    }

    // Delete from database
    await meetingsCollection.deleteOne({ id: meetingId });

    // Optionally, you could also end the Stream call here
    // const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);
    // const call = streamClient.video.call('default', meetingId);
    // await call.end();

    return NextResponse.json({ success: true, message: 'Meeting deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Delete meeting error:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
