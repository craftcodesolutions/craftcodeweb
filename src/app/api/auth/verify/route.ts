import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export async function GET(req: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = req.cookies.get('authToken')?.value;
    const userEmail = req.cookies.get('userEmail')?.value;

    console.log('Verify endpoint - authToken exists:', !!authToken);
    console.log('Verify endpoint - userEmail exists:', !!userEmail);

    if (!authToken || !userEmail) {
      console.log('Verify endpoint - No auth token or user email found');
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify the JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;
      console.log('Verify endpoint - Token verified successfully');
      
      // Check if token is about to expire (within 1 hour)
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      console.log('Verify endpoint - Time until token expiry:', timeUntilExpiry, 'seconds');
      
      if (timeUntilExpiry < 3600) { // Less than 1 hour
        console.log('Verify endpoint - Token expires soon');
      }
    } catch (error) {
      console.log('Verify endpoint - Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // Find user by email
    const user = await usersCollection.findOne({ email: userEmail.toLowerCase() });

    if (!user) {
      console.log('Verify endpoint - User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Verify endpoint - User found:', user.email);

    // Remove sensitive data from response
    const userWithoutSensitiveData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      profileImage: user.profileImage,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(
      {
        success: true,
        data: userWithoutSensitiveData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verify auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 