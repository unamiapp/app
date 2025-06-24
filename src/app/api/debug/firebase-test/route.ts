import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID ? 'SET' : 'MISSING',
      clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL ? 'SET' : 'MISSING',
      privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY ? 'SET' : 'MISSING',
      privateKeyLength: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.length || 0,
      privateKeyStart: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.substring(0, 50) || 'N/A'
    };

    // Try to initialize Firebase
    let firebaseStatus = 'NOT_TESTED';
    let firebaseError = null;
    
    try {
      const { adminDb } = await import('@/lib/firebase/admin');
      
      // Try a simple operation
      const testDoc = await adminDb.collection('test').limit(1).get();
      firebaseStatus = 'SUCCESS';
    } catch (error) {
      firebaseStatus = 'ERROR';
      firebaseError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      firebase: {
        status: firebaseStatus,
        error: firebaseError
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}