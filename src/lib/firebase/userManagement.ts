import { adminAuth, adminDb } from './admin';
import { UserRole } from '@/types/user';

export async function getOrCreateFirebaseUser(email: string, password: string, displayName: string, role: UserRole) {
  try {
    // Try to get existing user
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error) {
      // User doesn't exist, create new user
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName,
        disabled: false
      });
      
      // Create user profile in Firestore
      await adminDb.collection('users').doc(userRecord.uid).set({
        id: userRecord.uid,
        email,
        displayName,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      });
    }
    
    // Ensure user has correct role in Firestore
    await adminDb.collection('users').doc(userRecord.uid).update({
      role,
      updatedAt: new Date().toISOString()
    });
    
    // Set custom claims for role-based security rules
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });
    
    return userRecord;
  } catch (error) {
    console.error('Error in getOrCreateFirebaseUser:', error);
    throw error;
  }
}