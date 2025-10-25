import { NextRequest, NextResponse } from 'next/server';
import { insertGuestUser, getGuestUserById, cleanupExpiredGuests } from '@/controllers/guestUserService';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'b7Kq9rL8x2N5fG4vD1sZ3uP6wT0yH8mX';

console.log('🔑 Guest API JWT_SECRET configured:', JWT_SECRET ? 'Yes' : 'No');
console.log('🔑 Guest API JWT_SECRET value (first 10 chars):', JWT_SECRET.substring(0, 10));

// GET /api/guests - Get guest user by ID or cleanup expired guests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');
    const cleanup = searchParams.get('cleanup');

    if (cleanup === 'true') {
      const deletedCount = await cleanupExpiredGuests();
      return NextResponse.json({ 
        success: true, 
        message: `Cleaned up ${deletedCount} expired guests` 
      });
    }

    if (guestId) {
      const guestUser = await getGuestUserById(guestId);
      if (!guestUser) {
        return NextResponse.json({ 
          success: false, 
          error: 'Guest user not found' 
        }, { status: 404 });
      }

      // Check if guest is expired
      if (new Date(guestUser.expiresAt) < new Date()) {
        return NextResponse.json({ 
          success: false, 
          error: 'Guest user expired' 
        }, { status: 410 });
      }

      return NextResponse.json({ 
        success: true, 
        data: guestUser 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'guestId parameter required' 
    }, { status: 400 });

  } catch (error) {
    console.error('Error in guest GET:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST /api/guests - Create a new guest user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, dummyName, dummyEmail } = body;

    if (!guestId) {
      return NextResponse.json({ 
        success: false, 
        error: 'guestId is required' 
      }, { status: 400 });
    }

    // Check if guest already exists
    const existingGuest = await getGuestUserById(guestId);
    if (existingGuest) {
      // If exists and not expired, return existing guest with token
      if (new Date(existingGuest.expiresAt) > new Date()) {
        const token = jwt.sign({ guestId }, JWT_SECRET, { expiresIn: '24h' });
        return NextResponse.json({ 
          success: true, 
          data: existingGuest,
          token 
        });
      }
    }

    // Create new guest user
    const finalDummyName = dummyName || `Guest-${guestId.substring(0, 6)}`;
    const finalDummyEmail = dummyEmail || `${guestId.substring(0, 6)}@guest.local`;

    await insertGuestUser({ 
      guestId, 
      dummyName: finalDummyName, 
      dummyEmail: finalDummyEmail 
    });

    const newGuest = await getGuestUserById(guestId);
    const token = jwt.sign({ guestId }, JWT_SECRET, { expiresIn: '24h' });

    return NextResponse.json({ 
      success: true, 
      data: newGuest,
      token 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in guest POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}