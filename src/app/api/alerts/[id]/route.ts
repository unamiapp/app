import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { adminDb } from '@/lib/firebase/admin';

// GET /api/alerts/[id] - Get a specific alert
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role || 'parent';
    const alertId = params.id;
    
    // Get the alert document
    const alertDoc = await adminDb.collection('alerts').doc(alertId).get();
    
    if (!alertDoc.exists) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    const alertData = alertDoc.data();
    
    // Check permissions based on role
    if (userRole === 'parent') {
      // Get the child to check if this parent has access
      const childDoc = await adminDb.collection('children').doc(alertData?.childId).get();
      
      if (!childDoc.exists || childDoc.data()?.parentId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (userRole === 'school') {
      // Get the child to check if this school has access
      const childDoc = await adminDb.collection('children').doc(alertData?.childId).get();
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const schoolId = userDoc.data()?.schoolId;
      
      if (!childDoc.exists || childDoc.data()?.schoolId !== schoolId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    
    return NextResponse.json({
      id: alertDoc.id,
      ...alertData
    });
  } catch (error) {
    console.error('Error getting alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/alerts/[id] - Update an alert (e.g., resolve or cancel)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role || 'parent';
    const alertId = params.id;
    
    // Get the alert document
    const alertDoc = await adminDb.collection('alerts').doc(alertId).get();
    
    if (!alertDoc.exists) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    const alertData = alertDoc.data();
    
    // Check permissions based on role
    if (userRole !== 'admin' && userRole !== 'authority') {
      if (alertData?.createdBy !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    
    const data = await request.json();
    
    // Update the alert
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    // If status is being changed to resolved, add resolvedAt timestamp
    if (data.status === 'resolved' && alertData?.status !== 'resolved') {
      updateData.resolvedAt = new Date().toISOString();
    }
    
    await adminDb.collection('alerts').doc(alertId).update(updateData);
    
    return NextResponse.json({
      id: alertId,
      ...alertData,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/alerts/[id] - Delete an alert (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userRole = (session.user as any).role || 'parent';
    const alertId = params.id;
    
    // Only admins can delete alerts
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete the alert
    await adminDb.collection('alerts').doc(alertId).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}