import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// POST /api/admin/alerts - Create alert (admin only)
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/alerts - Starting request');
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.childId || !data.type || !data.description || !data.contactInfo) {
      console.log('POST /api/admin/alerts - Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get child data
    console.log(`POST /api/admin/alerts - Getting child data for ${data.childId}`);
    const childDoc = await adminDb.collection('children').doc(data.childId).get();
    
    if (!childDoc.exists) {
      console.log(`POST /api/admin/alerts - Child not found: ${data.childId}`);
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    
    const childData = childDoc.data();
    console.log('POST /api/admin/alerts - Child data found');
    
    // Create a simple alert structure
    const alertData = {
      childId: data.childId,
      childName: childData ? `${childData.firstName} ${childData.lastName}` : '',
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
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('POST /api/admin/alerts - Creating alert');
    
    const alertRef = adminDb.collection('alerts').doc();
    await alertRef.set(alertData);
    
    console.log(`POST /api/admin/alerts - Alert created with ID: ${alertRef.id}`);
    
    return NextResponse.json({ 
      id: alertRef.id,
      ...alertData
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin alert:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}