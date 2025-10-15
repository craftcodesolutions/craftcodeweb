/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'b7Kq9rL8x2N5fG4vD1sZ3uP6wT0yH8mX';

export async function GET(req: NextRequest) {
  try {
    // Get the httpOnly cookie
    const cookieStore = cookies();
    const authToken = (await cookieStore).get('authToken')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    // Verify the existing token
    let decoded: any;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Create a new short-lived token specifically for Socket.IO
    const socketToken = jwt.sign(
      { 
        userId: decoded.userId, 
        email: decoded.email,
        isAdmin: decoded.isAdmin,
        purpose: 'socket-auth'
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Short-lived token for Socket.IO
    );

    return NextResponse.json({
      socketToken,
      userId: decoded.userId,
      email: decoded.email
    }, { status: 200 });

  } catch (error) {
    console.error('Error in /api/auth/socket-token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
