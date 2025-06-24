import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }
    
    // Check if user already exists in Firebase Auth
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json({
        success: true,
        message: 'User already exists in Firebase Auth',
        alreadyExists: true
      });
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Find user in Firestore
    const usersSnapshot = await adminDb.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in Firestore' 
      }, { status: 404 });
    }
    
    // Create Firebase Auth account for this user
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      uid: userDoc.id,
      email: email,
      password: 'demo123', // Temporary password
      displayName: userData.displayName || userData.firstName + ' ' + userData.lastName || email.split('@')[0],
      emailVerified: true,
    });
    
    // Set custom claims for role-based access
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: userData.role || 'parent',
      roles: userData.roles || [userData.role || 'parent']
    });
    
    // Generate password reset link
    const resetLink = await adminAuth.generatePasswordResetLink(email);
    
    return NextResponse.json({
      success: true,
      message: 'User migrated to Firebase Auth',
      resetLink: resetLink
    });
  } catch (error) {
    console.error('Error migrating user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to migrate user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}