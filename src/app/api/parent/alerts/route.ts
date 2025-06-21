import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// POST /api/parent/alerts - Create alert (parent only)
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/parent/alerts - Starting request');
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.childId || !data.type || !data.description || !data.contactInfo) {
      console.log('POST /api/parent/alerts - Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get child data
    console.log(`POST /api/parent/alerts - Getting child data for ${data.childId}`);
    const childDoc = await adminDb.collection('children').doc(data.childId).get();
    
    if (!childDoc.exists) {
      console.log(`POST /api/parent/alerts - Child not found: ${data.childId}`);
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    
    const childData = childDoc.data();
    console.log('POST /api/parent/alerts - Child data found');
    
    // Check for duplicate active alerts for this child and type
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
      console.log(`POST /api/parent/alerts - Duplicate alert found for child ${data.childId} and type ${data.type}`);
      return NextResponse.json({ 
        error: 'An active alert of this type already exists for this child',
        code: 'duplicate-alert'
      }, { status: 409 });
    }
    
    // Create a simple alert structure
    const alertData = {
      childId: data.childId,
      childName: childData ? `${childData.firstName} ${childData.lastName}` : '',
      status: 'active',
      alertType: data.type,
      type: data.type, // Include both fields for compatibility
      description: data.description,
      lastSeen: {
        date: data.lastSeenDate || new Date().toISOString().split('T')[0],
        time: data.lastSeenTime || new Date().toTimeString().slice(0, 5),
        location: data.lastSeenLocation || '',
        description: data.lastSeenWearing || ''
      },
      // Include both old and new field structures for compatibility
      lastSeenLocation: data.lastSeenLocation || '',
      lastSeenWearing: data.lastSeenWearing || '',
      lastSeenDate: data.lastSeenDate || new Date().toISOString().split('T')[0],
      lastSeenTime: data.lastSeenTime || new Date().toTimeString().slice(0, 5),
      contactPhone: data.contactInfo || '',
      contactInfo: data.contactInfo || '',
      createdBy: 'parent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('POST /api/parent/alerts - Creating alert');
    
    const alertRef = adminDb.collection('alerts').doc();
    await alertRef.set(alertData);
    
    console.log(`POST /api/parent/alerts - Alert created with ID: ${alertRef.id}`);
    
    return NextResponse.json({ 
      id: alertRef.id,
      ...alertData
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating parent alert:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}