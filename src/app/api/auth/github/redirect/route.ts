// /app/api/auth/github/redirect/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    const githubAuthURL = new URL('https://github.com/login/oauth/authorize');
    githubAuthURL.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
    githubAuthURL.searchParams.set('scope', 'read:user user:email');
    githubAuthURL.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`);

    return NextResponse.redirect(githubAuthURL.toString());
}
