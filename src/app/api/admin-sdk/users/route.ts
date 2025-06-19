import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import * as admin from 'firebase-admin';
import { UserProfile } from '@/types/user';

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
    
    console.log('Firebase Admin SDK initialized successfully in users API');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

// Get admin services
const adminAuth = admin.auth();
const adminDb = admin.firestore();

// POST /api/admin-sdk/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin-sdk/users - Starting user creation');
    
    // Get the current user session
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user ? {
      id: (session.user as any).id,
      email: session.user.email,
      role: (session.user as any).role,
      roles: (session.user as any).roles
    } : 'No session');
    
    console.log('Full session object:', JSON.stringify(session, null, 2));
    
    // Check if the request is from a client-side registration
    const data = await request.json();
    const isRegistration = data.isRegistration === true;
    
    console.log('Request data:', {
      email: data.email,
      role: data.role,
      isRegistration
    });
    
    // For non-registration requests, verify admin permissions
    if (!isRegistration) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Check if user is admin
      const adminId = (session.user as any).id;
      const adminRole = ((session.user as any).role || '').toLowerCase();
      const adminRoles = ((session.user as any).roles || []).map((r: string) => r.toLowerCase());
      
      const isAdmin = adminRole === 'admin' || adminRoles.includes('admin');
      
      if (!isAdmin) {
        return NextResponse.json({ 
          error: 'Forbidden - Only administrators can create users',
          code: 'insufficient-permissions'
        }, { status: 403 });
      }
    }
    
    // Validate required fields
    if (!data.email || !data.displayName || !data.role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // For registration or admin creating a user without a password, generate a random password
    const password = data.password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '!';
    
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
    const authUserData: any = {
      email: data.email,
      password: password,
      displayName: data.displayName,
      disabled: false,
    };
    
    // Only add photoURL if it's a valid URL
    if (data.photoURL && data.photoURL.startsWith('http')) {
      authUserData.photoURL = data.photoURL;
    }
    
    const userRecord = await adminAuth.createUser(authUserData);
    
    console.log(`User created in Auth with UID: ${userRecord.uid}`);
    
    // Normalize role to lowercase to ensure consistency
    const normalizedRole = data.role.toLowerCase();
    
    // Set custom claims for role-based access
    await adminAuth.setCustomUserClaims(userRecord.uid, { 
      role: normalizedRole,
      roles: [normalizedRole]
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
      role: normalizedRole,
      roles: [normalizedRole],
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true,
      address: data.address || '',
      organization: data.organization || undefined,
    };
    
    await adminDb.collection('users').doc(userRecord.uid).set(userData);
    console.log(`User profile created in Firestore for: ${userRecord.uid}`);
    
    // Create audit log entry
    await adminDb.collection('audit_logs').add({
      userId: session?.user ? (session.user as any).id : 'system',
      userRole: session?.user ? (session.user as any).role : 'system',
      operation: 'create_user',
      resourceId: userRecord.uid,
      resourceType: 'users',
      timestamp,
      details: `User ${data.email} created with role ${data.role}`
    });
    
    return NextResponse.json({ ...userData }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ 
      error: 'Failed to create user', 
      message: error.message || 'Internal server error',
      code: error.code || 'unknown-error'
    }, { status: 500 });
  }
}

// GET /api/admin-sdk/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get admin role from session
    const userRole = ((session.user as any).role || '').toLowerCase();
    const userRoles = ((session.user as any).roles || []).map((r: string) => r.toLowerCase());
    
    // Check if user is admin
    const isAdmin = userRole === 'admin' || userRoles.includes('admin');
    
    if (!isAdmin) {
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

// PUT /api/admin-sdk/users - Update user
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = ((session.user as any).role || '').toLowerCase() === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Update in Firestore
    await adminDb.collection('users').doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    // Update in Firebase Auth if needed
    if (updateData.displayName || updateData.email || updateData.photoURL) {
      const authUpdate: any = {};
      if (updateData.displayName) authUpdate.displayName = updateData.displayName;
      if (updateData.email) authUpdate.email = updateData.email;
      if (updateData.photoURL && updateData.photoURL.startsWith('http')) {
        authUpdate.photoURL = updateData.photoURL;
      }
      await adminAuth.updateUser(id, authUpdate);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin-sdk/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = ((session.user as any).role || '').toLowerCase() === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Delete from Firebase Auth
    await adminAuth.deleteUser(id);
    
    // Delete from Firestore
    await adminDb.collection('users').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}