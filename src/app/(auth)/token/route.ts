import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.json(
      { token: null, message: 'No authToken cookie found' },
      { status: 401 }
    );
  }

  return NextResponse.json({ token });
}
