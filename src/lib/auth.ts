import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verifyAuth(req: NextRequest): Promise<{ isAuthenticated: boolean; userId: string | null; isAdmin: boolean }> {
  try {
    const token = req.cookies.get('authToken')?.value;
    if (!token) {
      return { isAuthenticated: false, userId: null, isAdmin: false };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hG8v$L1^r!eX9@dP2z&Bt7WfKmQsVjE3cYuT6nMwAoLjR5xZ') as { userId: string; isAdmin?: boolean };
    return { isAuthenticated: true, userId: decoded.userId, isAdmin: decoded.isAdmin || false };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { isAuthenticated: false, userId: null, isAdmin: false };
  }
}