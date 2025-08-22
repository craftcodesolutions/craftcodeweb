import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/config/mongodb';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/emailService';

const DB_NAME = 'CraftCode';
const COLLECTION = 'users';

export async function POST(req: NextRequest) {
  try {

    const { currentEmail, newEmail, password } = await req.json();

    // Validation
    if (!currentEmail || !newEmail || !password) {
      return NextResponse.json({ error: 'Current email, new email, and password are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentEmail) || !emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'Please enter valid email addresses' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION);

    const user = await usersCollection.findOne({ email: currentEmail.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify that the user matches the authenticated user
    if (!user._id) {
      return NextResponse.json({ error: 'Unauthorized: Current email does not match authenticated user' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Check if new email is already in use
    const existingUser = await usersCollection.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id !== user._id) {
      return NextResponse.json({ error: 'New email is already in use' }, { status: 400 });
    }

    const result = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { email: newEmail.toLowerCase(), updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
    }

    // Send welcome email to new email
    try {
      await sendWelcomeEmail(newEmail, user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Send admin notification
    try {
      await sendAdminNotification(newEmail, user.firstName);
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
    }

    return NextResponse.json({ success: true, message: 'Email updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update email error:', error);
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
  }
}