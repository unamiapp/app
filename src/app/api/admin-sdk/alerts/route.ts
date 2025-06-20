import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as admin from 'firebase-admin';
import { extractUserId, extractUserRole } from '@/lib/utils/sessionUtils';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY 
      ? process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\\\n/g, '\\n') 
      : undefined;
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
    });
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

const adminDb = admin.firestore();

// POST /api/admin-sdk/alerts - Create alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = extractUserId(session.user);
    const data = await request.json();
    
    // Ensure data has the correct structure
    const alertData = {
      ...data,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      // Ensure lastSeen is properly structured
      lastSeen: data.lastSeen || {
        date: data.lastSeenDate || new Date().toISOString().split('T')[0],
        time: data.lastSeenTime || new Date().toTimeString().slice(0, 5),
        location: data.lastSeenLocation || '',
        description: data.lastSeenWearing || ''
      },
      // Include all fields from the database structure
      clothingDescription: data.clothingDescription || data.lastSeenWearing || '',
      contactPhone: data.contactPhone || data.contactInfo || '',
      additionalInfo: data.additionalInfo || data.description || ''
    };

    const docRef = await adminDb.collection('alerts').add(alertData);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      ...alertData 
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

// GET /api/admin-sdk/alerts - Get alerts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = extractUserId(session.user);
    const userRole = extractUserRole(session.user);
    
    let alertsQuery: admin.firestore.Query = adminDb.collection('alerts');
    
    // Filter alerts based on role
    if (userRole === 'parent') {
      // For parents, first get their children
      const childrenSnapshot = await adminDb
        .collection('children')
        .where('guardians', 'array-contains', userId)
        .get();
      
      const childIds = childrenSnapshot.docs.map(doc => doc.id);
      
      if (childIds.length > 0) {
        alertsQuery = alertsQuery.where('childId', 'in', childIds);
      } else {
        // If no children found, just filter by createdBy
        alertsQuery = alertsQuery.where('createdBy', '==', userId);
      }
    }
    
    const alertsSnapshot = await alertsQuery.orderBy('createdAt', 'desc').get();
    const alerts = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}