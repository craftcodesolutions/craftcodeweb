/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/emailService';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const DB_NAME = 'CraftCode';
const COLLECTION = 'users';

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

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object
    const userData = {
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      picture: picture || '', // Optional picture field
      bio: bio || '', // Optional bio field
      isAdmin: false,
      status: true, // Default status to true (active)
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

    return NextResponse.json({ success: true, message: 'User created successfully' }, { status: 201 });
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

    // Build query for search
    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { bio: searchRegex },
      ];
    }

    // Get total count for pagination
    const totalUsers = await usersCollection.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    // Fetch users with pagination and search
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

    // Convert _id to string for compatibility with the frontend
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

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    // Update the specified field
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

    // Convert _id to string
    const updatedUser = {
      ...result,
      _id: result._id.toString(),
    };

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}