import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Return token data (safe to expose in development for debugging)
    return NextResponse.json({
      id: token.id,
      email: token.email,
      name: token.name,
      role: token.role,
      roles: token.roles,
      exp: token.exp,
      iat: token.iat,
    });
  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}