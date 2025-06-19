import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserProfile } from '@/types/user';

// GET /api/users - Get all users or filter by query parameters (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const userId = (session.user as any).id;
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    
    let usersQuery: any = adminDb.collection('users');
    
    // Apply filters if provided
    if (role) {
      usersQuery = usersQuery.where('role', '==', role);
    }
    
    if (isActive !== null) {
      usersQuery = usersQuery.where('isActive', '==', isActive === 'true');
    }
    
    const usersSnapshot = await usersQuery.get();
    const users = usersSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const adminId = (session.user as any).id;
    const adminDoc = await adminDb.collection('users').doc(adminId).get();
    
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Forbidden - Only administrators can create users',
        code: 'insufficient-permissions'
      }, { status: 403 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.password || !data.displayName || !data.role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user with this email already exists
    try {
      const existingUser = await adminAuth.getUserByEmail(data.email);
      if (existingUser) {
        return NextResponse.json({ 
          error: 'User with this email already exists',
          code: 'email-already-exists'
        }, { status: 409 });
      }
    } catch (error: any) {
      // If error code is auth/user-not-found, that's good - continue
      if (error.code !== 'auth/user-not-found') {
        console.error('Error checking existing user:', error);
        throw error;
      }
    }
    
    console.log(`Creating user with email: ${data.email}, role: ${data.role}`);
    
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      photoURL: data.photoURL,
      disabled: false,
    });
    
    console.log(`User created in Auth with UID: ${userRecord.uid}`);
    
    // Set custom claims for role-based access
    await adminAuth.setCustomUserClaims(userRecord.uid, { 
      role: data.role,
      roles: [data.role]
    });
    
    console.log(`Custom claims set for user: ${userRecord.uid}`);
    
    const timestamp = new Date().toISOString();
    
    // Create user profile in Firestore
    const userData: UserProfile = {
      id: userRecord.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      phoneNumber: data.phoneNumber,
      role: data.role,
      roles: [data.role],
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true,
      address: data.address,
      organization: data.organization,
    };
    
    await adminDb.collection('users').doc(userRecord.uid).set(userData);
    console.log(`User profile created in Firestore for: ${userRecord.uid}`);
    
    // Create audit log entry
    await adminDb.collection('audit_logs').add({
      userId: adminId,
      userRole: 'admin',
      operation: 'create_user',
      resourceId: userRecord.uid,
      resourceType: 'users',
      timestamp,
      details: `Admin ${adminId} created user ${data.email} with role ${data.role}`
    });
    
    return NextResponse.json(userData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Failed to create user', 
      message: error.message || 'Internal server error',
      code: error.code || 'unknown-error'
    }, { status: 500 });
  }
}

// PATCH /api/users - Update a user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }
    
    const currentUserId = (session.user as any).id;
    const userRef = adminDb.collection('users').doc(data.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user is updating their own profile or is an admin
    const currentUserDoc = await adminDb.collection('users').doc(currentUserId).get();
    const isAdmin = currentUserDoc.exists && currentUserDoc.data()?.role === 'admin';
    
    if (data.id !== currentUserId && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Remove id from the update data
    const { id, ...updateData } = data;
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // Only admins can change roles
    if (updateData.role && !isAdmin) {
      delete updateData.role;
    }
    
    await userRef.update(updateData);
    
    // Update display name in Firebase Auth if it's changed
    if (updateData.displayName) {
      await adminAuth.updateUser(data.id, {
        displayName: updateData.displayName,
      });
    }
    
    // Update photo URL in Firebase Auth if it's changed
    if (updateData.photoURL) {
      await adminAuth.updateUser(data.id, {
        photoURL: updateData.photoURL,
      });
    }
    
    return NextResponse.json({ id: data.id, ...updateData });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}