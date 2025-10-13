/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/emailService';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';
import { parse } from 'cookie';

// Constants
const DB_NAME = 'CraftCode';
const COLLECTION = 'users';
const SESSIONS_COLLECTION = 'user_sessions';
const DISABLED_ACCOUNTS_COLLECTION = 'disabled_accounts';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3008';

// Note: Run these indexes in MongoDB for performance:
// db.users.createIndex({ name: 1, email: 1, isAdmin: 1, status: 1, createdAt: -1, designations: 1 });

// Socket.IO server setup
let io: SocketIOServer | null = null;

// Initialize Socket.IO server
const initSocketServer = () => {
  if (!io) {
    const httpServer = createServer();
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST'],
      },
    });

    io.use((socket: Socket, next) => {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error('Authentication token required'));
      }
      const cookies = parse(cookieHeader);
      const token = cookies.authToken;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        socket.data.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket: Socket) => {
      socket.join(socket.data.userId); // Join user-specific room
    });

    httpServer.listen(new URL(SOCKET_URL).port || 3008, () => {});
  }
  return io;
};

// Emit token update to all sessions of a user
export const emitTokenUpdate = (userId: string, newToken: string) => {
  const socketServer = initSocketServer();
  const timestamp = new Date().toISOString();
  const reason = 'Admin status updated';

  socketServer.to(userId).emit('tokenUpdated', { newToken, timestamp, reason });
};

// Emit user status change to all clients
export const emitUserStatusChange = (userId: string, status: boolean) => {
  const socketServer = initSocketServer();
  const data: UserStatusChangeData = {
    userId,
    status,
    reason: status ? 'User account enabled' : 'User account disabled',
    timestamp: new Date().toISOString(),
    forcedDisconnect: !status,
  };

  socketServer.emit('userStatusChanged', data);
};

// Emit designations update to all sessions of a user
export const emitDesignationsUpdate = (userId: string, designations: string[]) => {
  const socketServer = initSocketServer();
  const timestamp = new Date().toISOString();
  const reason = 'Designations updated by admin';

  socketServer.to(userId).emit('designationsUpdated', { designations, timestamp, reason });
};

// Type definition for UserStatusChangeData
interface UserStatusChangeData {
  userId: string;
  status: boolean;
  reason: string;
  timestamp: string;
  forcedDisconnect?: boolean;
}

// Escape regex for safe search
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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
      designations: [], // Initialize designations
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
    } catch (emailError) {}

    // Send admin notification
    try {
      await sendAdminNotification(email, firstName);
    } catch (adminEmailError) {}

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
      designations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const search = searchParams.get('search') || '';
    const isAdminFilter = searchParams.get('isAdmin');
    const statusFilter = searchParams.get('status');
    const sortField = searchParams.get('sortField') || '';
    const sortOrder = searchParams.get('sortOrder') || '';
    const lastId = searchParams.get('lastId') || '';

    if (page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid page or limit parameters' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    const query: any = {};

    // Search filter
    if (search) {
      const searchRegex = new RegExp(escapeRegExp(search), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { bio: searchRegex },
        { designations: { $elemMatch: { $regex: searchRegex } } },
      ];
    }

    // Admin filter
    if (isAdminFilter === 'true' || isAdminFilter === 'false') {
      query.isAdmin = isAdminFilter === 'true';
    }

    // Status filter
    if (statusFilter === 'true' || statusFilter === 'false') {
      query.status = statusFilter === 'true';
    }

    // Cursor-based pagination
    if (lastId && ObjectId.isValid(lastId)) {
      query._id = { $gt: new ObjectId(lastId) };
    }

    // Count total users
    const totalUsers = await usersCollection.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

    // Adjust if requested page is greater than totalPages
    const validPage = Math.min(page, totalPages);
    const skip = lastId ? 0 : (validPage - 1) * limit;

    // Sorting
    const sort: any = {};
    if (sortField === 'name' || sortField === 'email') {
      sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort
    }

    // Fetch users
    const users = await usersCollection
      .find(query, {
        projection: {
          password: 0,
          resetToken: 0,
          resetTokenExpiry: 0,
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));

    // Get lastId for next page (cursor-based)
    const nextLastId = formattedUsers.length > 0 ? formattedUsers[formattedUsers.length - 1]._id : '';

    return NextResponse.json(
      {
        users: formattedUsers,
        totalUsers,
        totalPages,
        currentPage: validPage,
        nextLastId,
        filters: {
          search,
          isAdmin: isAdminFilter,
          status: statusFilter,
        },
        sort: {
          field: sortField,
          order: sortOrder,
        },
      },
      { status: 200 }
    );
  } catch (error) {
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

    if (!['isAdmin', 'status', 'designations'].includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    // Validate value types based on field
    if ((field === 'isAdmin' || field === 'status') && typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid value type for boolean field' }, { status: 400 });
    }

    if (field === 'designations' && (!Array.isArray(value) || !value.every((d: any) => typeof d === 'string'))) {
      return NextResponse.json({ error: 'Designations must be an array of strings' }, { status: 400 });
    }

    // Get current admin user from JWT token
    const authToken = req.cookies.get('authToken')?.value;
    let currentAdminUserId: string | null = null;
    
    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, JWT_SECRET) as any;
        currentAdminUserId = decoded.userId;
      } catch (error) {}
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
        }

        emitTokenUpdate(updatedUser._id, newToken);
      } catch (tokenError) {}
    }

    if (field === 'status') {
      emitUserStatusChange(updatedUser._id, value);
    }

    if (field === 'designations') {
      emitDesignationsUpdate(updatedUser._id, value);
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}