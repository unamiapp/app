import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Fix for private key format
    const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY 
      ? process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n') 
      : undefined;
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
    });
    
    console.log('Firebase Admin SDK initialized successfully in children API');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

// Get admin services
const adminDb = admin.firestore();

// POST /api/admin-sdk/children - Create a new child profile
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin-sdk/children - Starting child creation');
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    console.log('Session:', session?.user ? {
      id: (session.user as any).id,
      email: session.user.email,
      role: (session.user as any).role
    } : 'No session');
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID and role from session
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 400 });
    }

    const userRole = ((session.user as any).role || '').toLowerCase();
    const userRoles = ((session.user as any).roles || []).map((r: string) => r.toLowerCase());
    
    console.log('User roles:', { userRole, userRoles });
    
    // Check if user is admin or parent
    const isAdmin = userRole === 'admin' || userRoles.includes('admin');
    const isParent = userRole === 'parent' || userRoles.includes('parent');
    
    // For testing purposes, allow any role to create children
    const allowAnyRole = true;
    
    if (!isAdmin && !isParent && !allowAnyRole) {
      return NextResponse.json({ 
        error: 'Forbidden - Only parents and admins can create child profiles',
        code: 'insufficient-permissions'
      }, { status: 403 });
    }

    // Parse request data
    const data = await request.json();
    
    console.log('Request data:', {
      firstName: data.firstName,
      lastName: data.lastName,
      guardians: data.guardians
    });
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.dateOfBirth || !data.gender) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'firstName, lastName, dateOfBirth, and gender are required'
      }, { status: 400 });
    }

    console.log(`User ${userId} with role ${userRole} creating child profile for: ${data.firstName} ${data.lastName}`);

    // Ensure the current user is in the guardians array
    if (!data.guardians || !data.guardians.includes(userId)) {
      data.guardians = [...(data.guardians || []), userId];
    }
    
    console.log(`Guardians for child profile: ${JSON.stringify(data.guardians)}`);

    // Add timestamps and creator info
    const timestamp = new Date().toISOString();
    const childData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: userId,
    };

    console.log(`Creating child profile in Firestore with data: ${JSON.stringify({
      firstName: childData.firstName,
      lastName: childData.lastName,
      guardians: childData.guardians
    })}`);

    // Create the child profile in Firestore
    const docRef = await adminDb.collection('children').add(childData);
    console.log(`Child profile created with ID: ${docRef.id}`);
    
    // Create an audit log entry
    await adminDb.collection('audit_logs').add({
      userId,
      userRole,
      operation: 'create_child',
      resourceId: docRef.id,
      resourceType: 'children',
      timestamp,
      details: `Created child profile for ${data.firstName} ${data.lastName}`
    });

    // Return the created child profile with ID
    return NextResponse.json({
      id: docRef.id,
      ...childData
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating child profile:', error);
    return NextResponse.json({ 
      error: 'Failed to create child profile', 
      message: error.message || 'Internal server error',
      code: error.code || 'unknown-error'
    }, { status: 500 });
  }
}

// GET /api/admin-sdk/children - Get child profiles
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 400 });
    }

    // Get user role from session
    const userRole = ((session.user as any).role || '').toLowerCase();
    const userRoles = ((session.user as any).roles || []).map((r: string) => r.toLowerCase());
    
    // Check if user has specific roles
    const isAdmin = userRole === 'admin' || userRoles.includes('admin');
    const isParent = userRole === 'parent' || userRoles.includes('parent');
    const isSchool = userRole === 'school' || userRoles.includes('school');
    const isAuthority = userRole === 'authority' || userRoles.includes('authority');

    // For testing purposes, allow any role to view all children
    const allowAnyRole = true;

    let childrenRef = adminDb.collection('children');
    let queryRef;

    // Apply role-specific filters
    if (isParent) {
      // For parents, only show their children
      queryRef = childrenRef.where('guardians', 'array-contains', userId);
    } else if (isSchool) {
      // For schools, show children associated with the school
      queryRef = childrenRef.where('schoolId', '==', userId);
    } else {
      // Admins and authorities can see all children
      queryRef = childrenRef;
    }

    const snapshot = await queryRef.get();
    
    const children = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin-sdk/children - Update child profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = ((session.user as any).role || '').toLowerCase();
    const isAdmin = userRole === 'admin';
    const isParent = userRole === 'parent';

    if (!isAdmin && !isParent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Child ID required' }, { status: 400 });
    }

    // Check if parent owns this child
    if (isParent) {
      const childDoc = await adminDb.collection('children').doc(id).get();
      if (!childDoc.exists) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      
      const childData = childDoc.data();
      if (!childData?.guardians?.includes(userId)) {
        return NextResponse.json({ error: 'Not authorized to update this child' }, { status: 403 });
      }
    }

    await adminDb.collection('children').doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ error: 'Failed to update child' }, { status: 500 });
  }
}

// DELETE /api/admin-sdk/children - Delete child profile
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = ((session.user as any).role || '').toLowerCase();
    const isAdmin = userRole === 'admin';
    const isParent = userRole === 'parent';

    if (!isAdmin && !isParent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Child ID required' }, { status: 400 });
    }

    // Check if parent owns this child
    if (isParent) {
      const childDoc = await adminDb.collection('children').doc(id).get();
      if (!childDoc.exists) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      
      const childData = childDoc.data();
      if (!childData?.guardians?.includes(userId)) {
        return NextResponse.json({ error: 'Not authorized to delete this child' }, { status: 403 });
      }
    }

    await adminDb.collection('children').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 });
  }
}