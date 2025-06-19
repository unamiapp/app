// Direct user creation script using Firebase Admin SDK
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
    clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
  });
}

const auth = admin.auth();
const db = admin.firestore();

/**
 * Create a new user with Firebase Auth and Firestore profile
 * @param {string} email - User email
 * @param {string} password - Initial password
 * @param {string} displayName - User display name
 * @param {string} role - User role (admin, parent, school, authority, community)
 * @param {object} additionalData - Additional user profile data
 * @returns {Promise<string>} - User ID of created user
 */
async function createUser(email, password, displayName, role, additionalData = {}) {
  try {
    console.log(`Creating user with email: ${email}, role: ${role}`);
    
    // Create user in Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      disabled: false
    });
    
    console.log(`User created in Auth with UID: ${userRecord.uid}`);
    
    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role,
      roles: [role]
    });
    
    console.log(`Custom claims set for user: ${userRecord.uid}`);
    
    // Create Firestore profile
    const timestamp = new Date().toISOString();
    const userData = {
      id: userRecord.uid,
      email,
      displayName,
      role,
      roles: [role],
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true,
      ...additionalData
    };
    
    await db.collection('users').doc(userRecord.uid).set(userData);
    console.log(`User profile created in Firestore for: ${userRecord.uid}`);
    
    return userRecord.uid;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Create a child profile
 * @param {string} parentId - Parent user ID
 * @param {object} childData - Child profile data
 * @returns {Promise<string>} - Child document ID
 */
async function createChild(parentId, childData) {
  try {
    console.log(`Creating child profile for parent: ${parentId}`);
    
    // Ensure guardians array includes parent
    if (!childData.guardians) {
      childData.guardians = [parentId];
    } else if (!childData.guardians.includes(parentId)) {
      childData.guardians.push(parentId);
    }
    
    // Add timestamps and creator info
    const timestamp = new Date().toISOString();
    const completeChildData = {
      ...childData,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: parentId
    };
    
    // Create child document
    const docRef = await db.collection('children').add(completeChildData);
    console.log(`Child profile created with ID: ${docRef.id}`);
    
    // Create audit log
    await db.collection('audit_logs').add({
      userId: parentId,
      operation: 'create_child',
      resourceId: docRef.id,
      resourceType: 'children',
      timestamp,
      details: `Created child profile for ${childData.firstName} ${childData.lastName}`
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating child profile:', error);
    throw error;
  }
}

// Export functions for use in API routes
module.exports = {
  createUser,
  createChild
};

// Example usage (uncomment to test directly)
/*
async function test() {
  try {
    // Create a parent user
    const parentId = await createUser(
      'testparent@example.com',
      'Password123!',
      'Test Parent',
      'parent',
      { phoneNumber: '123-456-7890' }
    );
    
    // Create a child for this parent
    const childId = await createChild(parentId, {
      firstName: 'Test',
      lastName: 'Child',
      dateOfBirth: '2015-01-01',
      gender: 'female'
    });
    
    console.log('Test completed successfully!');
    console.log('Parent ID:', parentId);
    console.log('Child ID:', childId);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
*/