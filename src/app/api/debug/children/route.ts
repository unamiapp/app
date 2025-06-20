import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug API: Fetching children');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const parentId = searchParams.get('parentId');
    
    if (id) {
      // Get a specific child by ID
      const childDoc = await adminDb.collection('children').doc(id).get();
      
      if (!childDoc.exists) {
        return NextResponse.json({ 
          success: false, 
          error: 'Child not found' 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        child: {
          id: childDoc.id,
          ...childDoc.data()
        }
      });
    }
    
    // Build query based on filters
    let query = adminDb.collection('children');
    
    // Apply parent filter if provided
    if (parentId) {
      query = query.where('guardians', 'array-contains', parentId);
    }
    
    // Get total count first (for pagination)
    const countSnapshot = await query.get();
    const totalCount = countSnapshot.size;
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Get paginated results
    const snapshot = await query.get();
    
    // Manual pagination (Firestore doesn't support offset)
    const children = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .slice(startIndex, endIndex);

    console.log(`Debug API: Found ${children.length} children records (page ${page}, limit ${limit}, total ${totalCount})`);
    
    return NextResponse.json({ 
      success: true,
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      children 
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch children',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Debug API: Creating child');
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.dateOfBirth || !data.gender) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Add timestamps
    const now = new Date().toISOString();
    const childData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    // Create child in Firestore
    const childRef = adminDb.collection('children').doc();
    await childRef.set(childData);
    
    console.log(`Debug API: Child created with ID: ${childRef.id}`);
    
    return NextResponse.json({ 
      success: true, 
      id: childRef.id,
      child: {
        id: childRef.id,
        ...childData
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create child',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Debug API: Updating child');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child ID is required' 
      }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Check if child exists
    const childDoc = await adminDb.collection('children').doc(id).get();
    
    if (!childDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child not found' 
      }, { status: 404 });
    }
    
    // Add updated timestamp
    const childData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Update child in Firestore
    await adminDb.collection('children').doc(id).update(childData);
    
    console.log(`Debug API: Child updated with ID: ${id}`);
    
    return NextResponse.json({ 
      success: true, 
      id,
      child: {
        id,
        ...childData
      }
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update child',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('Debug API: Deleting child');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child ID is required' 
      }, { status: 400 });
    }
    
    // Check if child exists
    const childDoc = await adminDb.collection('children').doc(id).get();
    
    if (!childDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Child not found' 
      }, { status: 404 });
    }
    
    // Delete child from Firestore
    await adminDb.collection('children').doc(id).delete();
    
    console.log(`Debug API: Child deleted with ID: ${id}`);
    
    return NextResponse.json({ 
      success: true, 
      id,
      message: 'Child deleted successfully'
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete child',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}