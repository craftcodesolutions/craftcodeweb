import { NextResponse } from 'next/server';
import clientPromise from "@/config/mongodb";

const DB_NAME = "CraftCode";
const USERS_COLLECTION = "users";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@craftcode.com';

// GET /api/users/support - Get support user info (public endpoint for guests)
export async function GET() {
  try {
    console.log('🔍 Fetching support user info...');
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(USERS_COLLECTION);

    // Find support user by email
    const supportUser = await collection.findOne(
      { email: { $regex: new RegExp(`^${SUPPORT_EMAIL}$`, 'i') } },
      { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
    );

    if (!supportUser) {
      console.error('❌ Support user not found:', SUPPORT_EMAIL);
      return NextResponse.json({ 
        error: 'Support user not found' 
      }, { status: 404 });
    }

    const supportUserData = {
      _id: supportUser._id.toString(),
      email: supportUser.email,
      firstName: supportUser.firstName || 'Support',
      lastName: supportUser.lastName || 'Team',
      profileImage: supportUser.profileImage,
      isAdmin: true
    };

    console.log('✅ Support user found:', supportUserData._id);
    return NextResponse.json(supportUserData);

  } catch (error) {
    console.error('Error fetching support user:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}