import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3008';
    if (process.env.NODE_ENV === 'development') {
      console.log(SOCKET_URL);
    }

    // Perform a simple HTTP request to check if the Socket.IO server is running
    const response = await fetch(SOCKET_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'text/plain' },
    });

    if (!response.ok) {
      console.warn(`⚠️ Socket.IO server health check failed: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Socket.IO server is not reachable: ${response.statusText}` },
        { status: 503 }
      );
    }

    const text = await response.text();
    if (text !== 'Socket.IO server running') {
      console.warn('⚠️ Unexpected response from Socket.IO server:', text);
      return NextResponse.json(
        { error: 'Socket.IO server returned an unexpected response' },
        { status: 503 }
      );
    }

    console.log('✅ Socket.IO server is running and reachable');
    return NextResponse.json(
      { message: 'Socket.IO server is initialized and reachable' },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error in /api/socket:', err);
    return NextResponse.json(
      { error: `Internal server error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}