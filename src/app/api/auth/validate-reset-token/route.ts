import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import bcrypt from 'bcryptjs';

const DB_NAME = "CraftCode";
const COLLECTION = "users";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required', isValid: false },
        { status: 400 }
      );
    }

    // Validate token format (should be 64 character hex string)
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { error: 'Invalid token format', isValid: false },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    // Find users with valid reset tokens (not expired)
    const usersWithResetTokens = await usersCollection.find({
      resetToken: { $exists: true },
      resetTokenExpiry: { $gt: new Date() }
    }).toArray();

    if (!usersWithResetTokens || usersWithResetTokens.length === 0) {
      return NextResponse.json(
        { error: 'No valid reset tokens found', isValid: false },
        { status: 400 }
      );
    }

    // Find the user whose reset token matches the provided token
    let matchedUser = null;
    
    for (const user of usersWithResetTokens) {
      const isValidToken = await bcrypt.compare(token, user.resetToken);
      if (isValidToken) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      // Clean up expired tokens
      await usersCollection.updateMany(
        { resetTokenExpiry: { $lte: new Date() } },
        {
          $unset: {
            resetToken: "",
            resetTokenExpiry: ""
          }
        }
      );

      return NextResponse.json(
        { error: 'Invalid or expired reset token', isValid: false },
        { status: 400 }
      );
    }

    // Token is valid
    return NextResponse.json(
      { 
        message: 'Token is valid', 
        isValid: true,
        userEmail: matchedUser.email,
        expiresAt: matchedUser.resetTokenExpiry
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate token', isValid: false },
      { status: 500 }
    );
  }
}
