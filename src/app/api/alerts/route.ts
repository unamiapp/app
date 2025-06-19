import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { adminDb } from '@/lib/firebase/admin';
import { ChildAlert } from '@/types/child';

// GET /api/alerts - Get all alerts based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role || 'parent';
    
    let alertsQuery;
    
    // Different queries based on user role
    if (userRole === 'admin' || userRole === 'authority') {
      // Admins and authorities can see all alerts
      alertsQuery = adminDb.collection('alerts');
    } else if (userRole === 'parent') {
      // Parents can only see alerts for their own children
      // First get the parent's children
      const childrenSnapshot = await adminDb
        .collection('children')
        .where('parentId', '==', userId)
        .get();
      
      const childIds = childrenSnapshot.docs.map(doc => doc.id);
      
      if (childIds.length === 0) {
        return NextResponse.json({ alerts: [] });
      }
      
      // Then get alerts for those children
      alertsQuery = adminDb.collection('alerts').where('childId', 'in', childIds);
    } else if (userRole === 'school') {
      // Schools can see alerts for children in their school
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const schoolId = userDoc.data()?.schoolId;
      
      if (!schoolId) {
        return NextResponse.json({ error: 'School ID not found' }, { status: 400 });
      }
      
      // Get children in this school
      const childrenSnapshot = await adminDb
        .collection('children')
        .where('schoolId', '==', schoolId)
        .get();
      
      const childIds = childrenSnapshot.docs.map(doc => doc.id);
      
      if (childIds.length === 0) {
        return NextResponse.json({ alerts: [] });
      }
      
      // Then get alerts for those children
      alertsQuery = adminDb.collection('alerts').where('childId', 'in', childIds);
    } else {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }
    
    // Add status filter if provided
    const status = request.nextUrl.searchParams.get('status');
    if (status) {
      alertsQuery = alertsQuery.where('status', '==', status);
    }
    
    const alertsSnapshot = await alertsQuery.get();
    const alerts = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role || 'parent';
    
    // Only parents, authorities, and admins can create alerts
    if (userRole !== 'parent' && userRole !== 'authority' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.childId || !data.type || !data.description || !data.contactInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If parent, verify they are the parent of the child
    if (userRole === 'parent') {
      const childDoc = await adminDb.collection('children').doc(data.childId).get();
      
      if (!childDoc.exists) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      
      if (childDoc.data()?.parentId !== userId) {
        return NextResponse.json({ error: 'Not authorized to create alert for this child' }, { status: 403 });
      }
    }
    
    // Check for duplicate active alerts for this child and type
    const existingAlertsSnapshot = await adminDb.collection('alerts')
      .where('childId', '==', data.childId)
      .where('type', '==', data.type)
      .where('status', '==', 'active')
      .get();
    
    if (!existingAlertsSnapshot.empty) {
      return NextResponse.json({ 
        error: 'An active alert of this type already exists for this child',
        code: 'duplicate-alert'
      }, { status: 409 });
    }
    
    // Create the alert
    const alertData: any = {
      childId: data.childId,
      status: 'active',
      alertType: data.type,
      description: data.description,
      lastSeenLocation: data.lastSeenLocation,
      lastSeenWearing: data.lastSeenWearing,
      attachments: data.attachments,
      contactInfo: data.contactInfo,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const alertRef = adminDb.collection('alerts').doc();
    await alertRef.set(alertData);
    
    // If this is a missing child alert, we might want to send notifications
    if (data.type === 'missing') {
      // TODO: Implement notification system
      console.log('Missing child alert created, notifications would be sent here');
    }
    
    return NextResponse.json({ 
      id: alertRef.id,
      ...alertData
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}