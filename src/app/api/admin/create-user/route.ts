import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserProfile, UserRole } from '@/types/user';

/**
 * POST /api/admin/create-user
 * Server-side endpoint for creating users with different roles
 * Only accessible by admin users
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin ID from session
    const adminId = (session.user as any).id;
    if (!adminId) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 400 });
    }

    // Verify admin role
    const adminDoc = await adminDb.collection('users').doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Forbidden - Only administrators can access this endpoint',
        code: 'insufficient-permissions'
      }, { status: 403 });
    }

    // Parse request data
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.password || !data.displayName || !data.role) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Email, password, displayName, and role are required'
      }, { status: 400 });
    }

    // Validate role
    const validRoles: UserRole[] = ['admin', 'parent', 'school', 'authority', 'community'];
    if (!validRoles.includes(data.role)) {
      return NextResponse.json({ 
        error: 'Invalid role',
        details: `Role must be one of: ${validRoles.join(', ')}`
      }, { status: 400 });
    }

    console.log(`Admin ${adminId} creating user with email: ${data.email}, role: ${data.role}`);

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

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      photoURL: data.photoURL || '',
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
      photoURL: data.photoURL || '',
      phoneNumber: data.phoneNumber || '',
      role: data.role,
      roles: [data.role],
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true,
      address: data.address || '',
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
    
    return NextResponse.json({ 
      success: true,
      message: 'User created successfully',
      user: userData
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Failed to create user', 
      message: error.message || 'Internal server error',
      code: error.code || 'unknown-error'
    }, { status: 500 });
  }
}