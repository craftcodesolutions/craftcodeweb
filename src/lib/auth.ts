import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verifyAuth(req: NextRequest): Promise<{ isAuthenticated: boolean; userId: string | null; isAdmin: boolean }> {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return { isAuthenticated: false, userId: null, isAdmin: false };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'b7Kq9rL8x2N5fG4vD1sZ3uP6wT0yH8mX') as { userId: string; isAdmin?: boolean };
    return { isAuthenticated: true, userId: decoded.userId, isAdmin: decoded.isAdmin || false };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { isAuthenticated: false, userId: null, isAdmin: false };
  }
}