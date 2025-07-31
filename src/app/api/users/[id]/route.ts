/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserProfile, deleteUser } from '@/controllers/userService';
import { verifyAuth } from '@/lib/auth';
import { User } from '@/types/User';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define the context type explicitly
type RouteContext = { params: { id: string } };

// GET /api/users/[id]
export async function GET(req: NextRequest, context: any) {
  const { params } = context as RouteContext; // Type assertion to enforce correct type
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.userId !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...userData } = user;
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, context: any) {
  const { params } = context as RouteContext; // Type assertion
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.userId !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email, bio, profileImage } = body;

    if (!firstName && !lastName && !email && !bio && !profileImage) {
      return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (bio && bio.length > 500) {
      return NextResponse.json({ error: 'Bio cannot exceed 500 characters' }, { status: 400 });
    }

    const updateData: Partial<User> = {
      firstName,
      lastName,
      email,
      bio,
      profileImage,
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const updatedUser = await updateUserProfile(id, updateData);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    const token = jwt.sign(
      {
        userId: updatedUser?._id?.toString?.() ?? '',
        email: updatedUser?.email ?? '',
        isAdmin: updatedUser?.isAdmin ?? false,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      { ...updatedUser, password: undefined },
      { status: 200 }
    );

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    if (updatedUser.email) {
      response.cookies.set('userEmail', updatedUser.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]
export async function DELETE(req: NextRequest, context: any) {
  const { params } = context as RouteContext; // Type assertion
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.userId !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteUser(id);

    const response = NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    response.cookies.delete('authToken');
    response.cookies.delete('userEmail');
    return response;
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}