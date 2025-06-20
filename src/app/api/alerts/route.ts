import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { adminDb } from '@/lib/firebase/admin';
import { ChildAlert } from '@/types/child';
import { extractUserId, extractUserRole } from '@/lib/utils/sessionUtils';

// GET /api/alerts - Get all alerts based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract user ID and role from session using utility functions
    const userId = extractUserId(session.user);
    const userRole = extractUserRole(session.user);
    
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
      const schoolName = userDoc.data()?.organization?.name || userDoc.data()?.schoolName;
      
      if (!schoolId && !schoolName) {
        return NextResponse.json({ error: 'School information not found' }, { status: 400 });
      }
      
      // Get children in this school - try both schoolId and schoolName fields
      let childrenSnapshot;
      if (schoolId) {
        childrenSnapshot = await adminDb
          .collection('children')
          .where('schoolId', '==', schoolId)
          .get();
      } else if (schoolName) {
        childrenSnapshot = await adminDb
          .collection('children')
          .where('schoolName', '==', schoolName)
          .get();
      } else {
        return NextResponse.json({ alerts: [] });
      }
      
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
    console.log('POST /api/alerts - Starting request');
    const session = await getServerSession();
    
    if (!session?.user) {
      console.log('POST /api/alerts - Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Session user:', JSON.stringify(session.user, null, 2));
    
    // Extract user ID and role directly from session
    const userId = (session.user as any).id || 
                  (session.user as any).uid || 
                  (session.user as any).sub || 
                  (session.user as any).email || 
                  'admin-user';
    
    // Check if this is an admin request
    const userRole = data._adminRequest ? 'admin' : ((session.user as any).role || 'parent');
    
    console.log(`POST /api/alerts - User: ${userId}, Role: ${userRole}`);
    
    // Only parents, authorities, and admins can create alerts
    if (userRole !== 'parent' && userRole !== 'authority' && userRole !== 'admin') {
      console.log(`POST /api/alerts - Unauthorized role: ${userRole}`);
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }
    
    const data = await request.json();
    console.log('POST /api/alerts - Received data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.childId || !data.type || !data.description || !data.contactInfo) {
      console.log('POST /api/alerts - Missing required fields');
      console.log(`childId: ${data.childId}, type: ${data.type}, description: ${data.description}, contactInfo: ${data.contactInfo}`);
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get child data regardless of role
    console.log(`POST /api/alerts - Getting child data for ${data.childId}`);
    const childDoc = await adminDb.collection('children').doc(data.childId).get();
    
    if (!childDoc.exists) {
      console.log(`POST /api/alerts - Child not found: ${data.childId}`);
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    
    const childData = childDoc.data();
    console.log('POST /api/alerts - Child data:', JSON.stringify(childData, null, 2));
    
    // Skip authorization check for admin requests
    if (data._adminRequest) {
      console.log(`POST /api/alerts - Admin request detected, bypassing authorization check`);
    }
    // If parent, verify they are the parent/guardian of the child
    else if (userRole === 'parent') {
      console.log(`POST /api/alerts - Verifying parent ${userId} for child ${data.childId}`);
      
      // Check if user is a guardian of the child
      const isGuardian = childData?.guardians && Array.isArray(childData.guardians) && 
                         childData.guardians.includes(userId);
      
      if (!isGuardian) {
        console.log(`POST /api/alerts - User ${userId} is not a guardian of child ${data.childId}`);
        return NextResponse.json({ error: 'Not authorized to create alert for this child' }, { status: 403 });
      }
    } 
    // Admins and authorities can create alerts for any child
    else if (userRole === 'admin' || userRole === 'authority') {
      console.log(`POST /api/alerts - User ${userId} with role ${userRole} is authorized to create alerts for any child`);
    } 
    // Other roles are not authorized
    else {
      console.log(`POST /api/alerts - User ${userId} with role ${userRole} is not authorized to create alerts`);
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }
    
    // Check for duplicate active alerts for this child and type
    // Note: We need to check both alertType and type fields for compatibility
    const existingAlertsSnapshot = await adminDb.collection('alerts')
      .where('childId', '==', data.childId)
      .where('status', '==', 'active')
      .get();
      
    // Filter results manually to check both alertType and type fields
    const duplicateAlerts = existingAlertsSnapshot.docs.filter(doc => {
      const alertData = doc.data();
      return (alertData.alertType === data.type || alertData.type === data.type);
    });
    
    if (duplicateAlerts.length > 0) {
      console.log(`POST /api/alerts - Duplicate alert found for child ${data.childId} and type ${data.type}`);
      return NextResponse.json({ 
        error: 'An active alert of this type already exists for this child',
        code: 'duplicate-alert'
      }, { status: 409 });
    }
    
    // Create a simple alert structure that works for all dashboards
    const alertData: any = {
      childId: data.childId,
      status: 'active',
      alertType: data.type,
      description: data.description,
      lastSeen: {
        date: data.lastSeenDate || new Date().toISOString().split('T')[0],
        time: data.lastSeenTime || new Date().toTimeString().slice(0, 5),
        location: data.lastSeenLocation || '',
        description: data.lastSeenWearing || ''
      },
      contactPhone: data.contactInfo || '',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('POST /api/alerts - Creating alert with data:', JSON.stringify(alertData, null, 2));
    
    try {
      const alertRef = adminDb.collection('alerts').doc();
      await alertRef.set(alertData);
      console.log(`POST /api/alerts - Alert created with ID: ${alertRef.id}`);
      
      return NextResponse.json({ 
        id: alertRef.id,
        ...alertData
      }, { status: 201 });
    } catch (dbError) {
      console.error('POST /api/alerts - Database error:', dbError);
      return NextResponse.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}