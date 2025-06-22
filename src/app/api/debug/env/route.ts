import { NextResponse } from 'next/server';

export async function GET() {
  // Return a sanitized version of environment variables
  return NextResponse.json({
    env: {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      FIREBASE_SERVICE_ACCOUNT_PROJECT_ID: !!process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}