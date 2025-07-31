import { NextResponse } from 'next/server';

export async function GET() {
    const redirect_uri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!, // Must match the Console
        redirect_uri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
    });

    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
