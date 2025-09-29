/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('CraftCode');
    const clientsCollection = db.collection('users');

    // Fetch all clients
    const clients = await clientsCollection
      .find({})
      .toArray();

    const formattedClients = clients.map((clientDoc) => ({
      ...clientDoc,
      _id: clientDoc._id.toString(),
    }));

    return NextResponse.json({ clients: formattedClients }, { status: 200 });
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
