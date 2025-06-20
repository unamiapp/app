import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug API: Fetching all alerts');
    
    // Get all alerts from Firestore
    const snapshot = await adminDb.collection('alerts').get();
    
    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Debug API: Found ${alerts.length} alert records`);
    
    return NextResponse.json({ 
      success: true,
      count: alerts.length,
      alerts 
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}