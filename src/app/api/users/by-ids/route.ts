import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'users';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.getAll('ids');

    if (!ids || ids.length === 0) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    const { ObjectId } = await import('mongodb');
    
    // Convert string IDs to ObjectIds, filtering out invalid ones
    const objectIds = ids.map(id => {
      try {
        return new ObjectId(id);
      } catch {
        return null;
      }
    }).filter((id): id is InstanceType<typeof ObjectId> => id !== null);

    if (objectIds.length === 0) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    // Fetch users by IDs
    const users = await usersCollection
      .find(
        { _id: { $in: objectIds } },
        {
          projection: {
            password: 0,
            resetToken: 0,
            resetTokenExpiry: 0,
          },
        }
      )
      .toArray();

    // Format users for response
    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json(
      {
        users: formattedUsers,
        count: formattedUsers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users by IDs error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
