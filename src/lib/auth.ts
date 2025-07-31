import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verifyAuth(req: NextRequest): Promise<{ isAuthenticated: boolean; userId: string | null }> {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return { isAuthenticated: false, userId: null };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    return { isAuthenticated: true, userId: decoded.userId };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { isAuthenticated: false, userId: null };
  }
}