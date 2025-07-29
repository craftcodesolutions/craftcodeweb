import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { sendPasswordResetEmail } from '@/lib/emailService';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const DB_NAME = "CraftCode";
const COLLECTION = "users";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    // Check if user exists
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Hash the reset token before storing
    const hashedResetToken = await bcrypt.hash(resetToken, 12);

    // Update user with reset token
    await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          resetToken: hashedResetToken,
          resetTokenExpiry: resetTokenExpiry
        }
      }
    );

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    await sendPasswordResetEmail(email, user.firstName, resetUrl);

    return NextResponse.json(
      { message: 'Password reset link sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 