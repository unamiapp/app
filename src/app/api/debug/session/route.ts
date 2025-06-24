import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug session - Environment check:', {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasFirebaseProjectId: !!process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      hasFirebaseClientEmail: !!process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      hasFirebasePrivateKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY
    });
    
    const session = await getServerSession(authOptions);
    
    console.log('Debug session result:', {
      hasSession: !!session,
      sessionUser: session?.user || null
    });
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString(),
      environment: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}