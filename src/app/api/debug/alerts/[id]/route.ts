import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Debug API: Fetching alert with ID: ${params.id}`);
    
    // Get the alert from Firestore
    const alertDoc = await adminDb.collection('alerts').doc(params.id).get();
    
    if (!alertDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Alert not found' 
      }, { status: 404 });
    }
    
    const alert = {
      id: alertDoc.id,
      ...alertDoc.data()
    };
    
    // If the alert has a childId, fetch the child data
    let child = null;
    if (alert.childId) {
      const childDoc = await adminDb.collection('children').doc(alert.childId).get();
      if (childDoc.exists) {
        child = {
          id: childDoc.id,
          ...childDoc.data()
        };
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      alert,
      child
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch alert',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`Debug API: Updating alert with ID: ${params.id}`);
    
    // Get the request body
    const data = await request.json();
    
    // Check if the alert exists
    const alertDoc = await adminDb.collection('alerts').doc(params.id).get();
    
    if (!alertDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Alert not found' 
      }, { status: 404 });
    }
    
    // Update the alert
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // If status is being changed to resolved, add resolvedAt timestamp
    if (data.status === 'resolved') {
      updateData.resolvedAt = new Date().toISOString();
    }
    
    await adminDb.collection('alerts').doc(params.id).update(updateData);
    
    // Get the updated alert
    const updatedAlertDoc = await adminDb.collection('alerts').doc(params.id).get();
    
    const updatedAlert = {
      id: updatedAlertDoc.id,
      ...updatedAlertDoc.data()
    };
    
    return NextResponse.json({ 
      success: true, 
      alert: updatedAlert
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update alert',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}