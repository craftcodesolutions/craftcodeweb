'use server';

import { cookies } from 'next/headers';
import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  // Get user from auth token cookie
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  if (!authToken) {
    throw new Error('User is not authenticated');
  }

  let userId: string;
  
  try {
    // Fetch user from your auth API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/me`, {
      method: 'POST',
      headers: {
        'Cookie': `authToken=${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate user');
    }

    const userData = await response.json();
    userId = userData.userId;
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('User is not authenticated');
  }

  if (!STREAM_API_KEY) throw new Error('Stream API key is missing');
  if (!STREAM_API_SECRET) throw new Error('Stream API secret is missing');

  const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

  const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const issuedAt = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

  const token = streamClient.createToken(userId, expirationTime, issuedAt);

  return token;
};
