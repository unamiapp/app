// Direct Firebase Admin SDK solution for user and child management
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
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

// Create a user with Firebase Auth and Firestore profile
async function createUser(email, password, displayName, role) {
  try {
    // Create user in Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      disabled: false
    });
    
    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role,
      roles: [role]
    });
    
    // Create Firestore profile
    const timestamp = new Date().toISOString();
    await db.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      displayName,
      role,
      roles: [role],
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true
    });
    
    return userRecord.uid;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Create a child profile
async function createChild(parentId, childData) {
  try {
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
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating child profile:', error);
    throw error;
  }
}

// Example usage
async function createTestData() {
  try {
    // Create admin user
    const adminId = await createUser(
      'admin@example.com',
      'Password123!',
      'Admin User',
      'admin'
    );
    console.log('Created admin user with ID:', adminId);
    
    // Create parent user
    const parentId = await createUser(
      'parent@example.com',
      'Password123!',
      'Parent User',
      'parent'
    );
    console.log('Created parent user with ID:', parentId);
    
    // Create child profile
    const childId = await createChild(parentId, {
      firstName: 'Test',
      lastName: 'Child',
      dateOfBirth: '2015-01-01',
      gender: 'female'
    });
    console.log('Created child profile with ID:', childId);
    
    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Export functions for use in API routes
module.exports = {
  createUser,
  createChild,
  createTestData
};

// Uncomment to run the test data creation
// createTestData();