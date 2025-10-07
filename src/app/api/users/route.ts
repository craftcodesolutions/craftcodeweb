/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/emailService';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { emitTokenUpdate, emitUserStatusChange } from '@/lib/socketServer';

const DB_NAME = 'CraftCode';
const COLLECTION = 'users';
const SESSIONS_COLLECTION = 'user_sessions';
const DISABLED_ACCOUNTS_COLLECTION = 'disabled_accounts';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, picture, bio } = await req.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'First name, last name, email, and password are required' }, { status: 400 });
    }

    if (firstName.length < 2 || lastName.length < 2) {
      return NextResponse.json({ error: 'First name and last name must be at least 2 characters long' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);
    const disabledAccountsCollection = db.collection(DISABLED_ACCOUNTS_COLLECTION);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Check if email is in disabled accounts
    const disabledAccount = await disabledAccountsCollection.findOne({ email: email.toLowerCase() });
    if (disabledAccount) {
      return NextResponse.json({ 
        error: 'This email address is associated with a disabled account. Please contact support to reactivate your account.',
        disabled: true 
      }, { status: 403 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object
    const userData = {
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      picture: picture || '',
      bio: bio || '',
      isAdmin: false,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert user into database
    const result = await usersCollection.insertOne(userData);

    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(email, firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Send admin notification
    try {
      await sendAdminNotification(email, firstName);
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      userId: result.insertedId.toString(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      isAdmin: false,
      profileImage: picture || '',
      bio: bio || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }, { status: 201 });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const search = searchParams.get('search') || '';

    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid page or limit parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { bio: searchRegex },
      ];
    }

    const totalUsers = await usersCollection.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await usersCollection
      .find(query, {
        projection: {
          password: 0,
          resetToken: 0,
          resetTokenExpiry: 0,
        },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json(
      {
        users: formattedUsers,
        totalPages,
        currentPage: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const { field, value } = await req.json();

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (!['isAdmin', 'status'].includes(field) || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid field or value' }, { status: 400 });
    }

    // Get current admin user from JWT token
    const authToken = req.cookies.get('authToken')?.value;
    let currentAdminUserId: string | null = null;
    
    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, JWT_SECRET) as any;
        currentAdminUserId = decoded.userId;
      } catch (error) {
        console.error('Failed to decode admin token:', error);
      }
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);
    const sessionsCollection = db.collection(SESSIONS_COLLECTION);

    const update: any = {
      $set: {
        [field]: value,
        updatedAt: new Date(),
      },
    };

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      update,
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          resetToken: 0,
          resetTokenExpiry: 0,
        },
      }
    );

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser: any = {
      ...result,
      _id: result._id.toString(),
    };

    const response = NextResponse.json(updatedUser, { status: 200 });

    // If admin status was changed, regenerate JWT tokens for ALL user sessions
    if (field === 'isAdmin') {
      try {
        const newToken = jwt.sign(
          {
            userId: updatedUser._id,
            email: updatedUser.email || '',
            isAdmin: updatedUser.isAdmin || false,
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        const sessionUpdateResult = await sessionsCollection.updateMany(
          { 
            userId: updatedUser._id,
            isActive: true,
            expiresAt: { $gt: new Date() }
          },
          {
            $set: {
              token: newToken,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
            },
          }
        );

        console.log(`Updated ${sessionUpdateResult.modifiedCount} active sessions for user ${userId} due to admin status change to ${value}`);

        const isUpdatingOwnAccount = currentAdminUserId === updatedUser._id;

        if (isUpdatingOwnAccount) {
          response.cookies.set('authToken', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          });

          response.cookies.set('userEmail', updatedUser.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
          });

          console.log(`Admin updated their own account - session cookies refreshed`);
        } else {
          console.log(`Admin ${currentAdminUserId} updated user ${updatedUser._id} - admin session preserved`);
        }

        emitTokenUpdate(updatedUser._id, newToken);

      } catch (tokenError) {
        console.error('Failed to regenerate JWT tokens for user sessions:', tokenError);
      }
    }

    if (field === 'status') {
      emitUserStatusChange(updatedUser._id, value);
    }

    return response;
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}