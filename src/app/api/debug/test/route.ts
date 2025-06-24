import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    // Test Firebase connection
    console.log('Testing Firebase connection...');
    
    // Try to get a document from users collection
    const usersSnapshot = await adminDb.collection('users').limit(1).get();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase connection successful',
      collections: {
        users: {
          exists: true,
          count: usersSnapshot.size
        }
      }
    });
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Firebase connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}