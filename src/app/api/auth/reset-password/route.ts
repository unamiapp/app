import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }
    
    // First check if user exists in Firebase Auth
    let firebaseAuthUser = null;
    try {
      firebaseAuthUser = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // If user exists in Firebase Auth, send password reset email
    if (firebaseAuthUser) {
      const resetLink = await adminAuth.generatePasswordResetLink(email);
      
      // In production, you would send this link via email service
      console.log(`Password reset link for ${email}:`, resetLink);
      
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent',
        userType: 'firebase-auth'
      });
    }
    
    // If not in Firebase Auth, check if user exists in Firestore
    const usersSnapshot = await adminDb.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // User exists in Firestore but not in Firebase Auth
    // Create Firebase Auth account for this user
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    try {
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
      
      // In production, you would send this link via email service
      console.log(`Password reset link for ${email} (newly created):`, resetLink);
      
      return NextResponse.json({
        success: true,
        message: 'User migrated to Firebase Auth and password reset email sent',
        userType: 'migrated'
      });
    } catch (error) {
      console.error('Error creating Firebase Auth user:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create Firebase Auth user',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing password reset:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process password reset',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}