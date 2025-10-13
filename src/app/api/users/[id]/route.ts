/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserProfile, deleteUser } from '@/controllers/userService';
import { verifyAuth } from '@/lib/auth';
import { User } from '@/types/User';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hG8v$L1^r!eX9@dP2z&Bt7WfKmQsVjE3cYuT6nMwAoLjR5xZ';

// Context type — note `Promise`
type RouteContext = { params: Promise<{ id: string }> };

// GET /api/users/[id]
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = {
      userId: user.userId || user._id.toString(),
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'User',
      email: user.email || 'N/A',
      bio: user.bio || 'No bio available',
      avatar:
        user.profileImage && typeof user.profileImage === 'string' && user.profileImage.trim() !== ''
          ? user.profileImage
          : null,
      designations: user.designations || [],
    };

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
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isSelf = authResult.userId === id;
    const isAdmin = authResult.isAdmin;
    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email, bio, profileImage, designations, isAdmin: adminStatus, status } = body;

    if (!firstName && !lastName && !email && !bio && !profileImage && !designations && adminStatus === undefined && status === undefined) {
      return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (bio && bio.length > 500) {
      return NextResponse.json({ error: 'Bio cannot exceed 500 characters' }, { status: 400 });
    }

    if (designations && (!Array.isArray(designations) || !designations.every((d: any) => typeof d === 'string'))) {
      return NextResponse.json({ error: 'Designations must be an array of strings' }, { status: 400 });
    }

    if (adminStatus !== undefined && typeof adminStatus !== 'boolean') {
      return NextResponse.json({ error: 'Admin status must be a boolean' }, { status: 400 });
    }

    if (status !== undefined && typeof status !== 'boolean') {
      return NextResponse.json({ error: 'Status must be a boolean' }, { status: 400 });
    }

    // Restrict non-admins from updating admin/status fields
    const updateData: Partial<User> = { firstName, lastName, email, bio, profileImage, designations };
    if (isAdmin) {
      if (adminStatus !== undefined) updateData.isAdmin = adminStatus;
      if (status !== undefined) updateData.status = status;
    }

    // remove undefined keys
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

    const response = NextResponse.json({ ...updatedUser, password: undefined }, { status: 200 });

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
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

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