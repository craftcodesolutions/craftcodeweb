import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import bcrypt from 'bcryptjs';

const DB_NAME = "CraftCode";
const COLLECTION = "users";

// Rate limiting: Track reset attempts per IP
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_RESET_ATTEMPTS = 5;
const RESET_WINDOW = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const attemptData = resetAttempts.get(clientIP);

    if (attemptData) {
      // Clean up old attempts
      if (now - attemptData.lastAttempt > RESET_WINDOW) {
        resetAttempts.delete(clientIP);
      } else if (attemptData.count >= MAX_RESET_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many reset attempts. Please try again later.' },
          { status: 429 }
        );
      }
    }

    const { token, password } = await req.json();

    console.log('Reset password request received');
    console.log('Token received:', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Password provided:', !!password);

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate token format (should be 64 character hex string)
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
      console.log('Invalid token format');
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Enhanced password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be less than 128 characters' },
        { status: 400 }
      );
    }

    // Basic password strength check
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    // Find all users with valid reset tokens
    const usersWithResetTokens = await usersCollection.find({
      resetToken: { $exists: true },
      resetTokenExpiry: { $gt: new Date() }
    }).toArray();

    console.log('Users with valid reset tokens:', usersWithResetTokens.length);
    console.log('Current time:', new Date());

    if (!usersWithResetTokens || usersWithResetTokens.length === 0) {
      console.log('No users found with valid reset tokens');
      
      // Check if there are any users with reset tokens at all (including expired)
      const allUsersWithTokens = await usersCollection.find({
        resetToken: { $exists: true }
      }).toArray();
      
      console.log('Users with any reset tokens (including expired):', allUsersWithTokens.length);
      if (allUsersWithTokens.length > 0) {
        console.log('Sample token expiry:', allUsersWithTokens[0].resetTokenExpiry);
      }

      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find the user whose reset token matches the provided token
    let matchedUser = null;
    let tokenUsedUser = null; // Track which user's token was attempted
    
    console.log('Received token:', token);
    console.log('Checking against', usersWithResetTokens.length, 'users');
    
    for (const user of usersWithResetTokens) {
      console.log('Comparing token for user:', user.email);
      console.log('Stored hashed token:', user.resetToken);
      
      const isValidToken = await bcrypt.compare(token, user.resetToken);
      console.log('Token comparison result:', isValidToken);
      
      if (isValidToken) {
        matchedUser = user;
        tokenUsedUser = user;
        console.log('Token matched for user:', user.email);
        break;
      }
    }

    // If no match found, check if token was used before (one-time use security)
    if (!matchedUser) {
      // Try to find any user who might have had this token (for cleanup)
      const allUsers = await usersCollection.find({
        resetToken: { $exists: true }
      }).toArray();
      
      for (const user of allUsers) {
        const wasValidToken = await bcrypt.compare(token, user.resetToken);
        if (wasValidToken) {
          tokenUsedUser = user;
          break;
        }
      }
    }

    if (!matchedUser) {
      console.log('No matching user found for token');
      console.log('tokenUsedUser:', tokenUsedUser ? tokenUsedUser.email : 'none');
      
      // Track failed attempt
      const currentAttempts = resetAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      resetAttempts.set(clientIP, {
        count: currentAttempts.count + 1,
        lastAttempt: now
      });

      // Clear the specific token that was attempted (one-time use)
      if (tokenUsedUser) {
        console.log('Clearing token for user:', tokenUsedUser.email);
        await usersCollection.updateOne(
          { _id: tokenUsedUser._id },
          {
            $unset: {
              resetToken: "",
              resetTokenExpiry: ""
            }
          }
        );
      }

      // Also clear all expired reset tokens to prevent token reuse attempts
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
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password and clear reset token (one-time use)
    await usersCollection.updateOne(
      { _id: matchedUser._id },
      {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date() // Track when password was changed
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: ""
        }
      }
    );

    // Clear successful reset attempt from rate limiting
    resetAttempts.delete(clientIP);

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
} 