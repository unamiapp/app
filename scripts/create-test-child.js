// Script to create a test child directly
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
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
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    process.exit(1);
  }
}

async function createTestChild() {
  try {
    // Get the first user from the users collection to use as a guardian
    const usersSnapshot = await admin.firestore().collection('users').limit(1).get();
    
    if (usersSnapshot.empty) {
      console.error('No users found. Please create a user first.');
      process.exit(1);
    }
    
    const user = usersSnapshot.docs[0];
    const userId = user.id;
    const userData = user.data();
    
    console.log(`Using user ${userData.email} (${userId}) as guardian`);
    
    // Create a test child
    const childData = {
      firstName: `TestChild-${Date.now()}`,
      lastName: 'TestLastName',
      dateOfBirth: '2020-01-01',
      gender: 'male',
      guardians: [userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    };
    
    const docRef = await admin.firestore().collection('children').add(childData);
    
    console.log(`Child profile created with ID: ${docRef.id}`);
    console.log('Child data:', childData);
  } catch (error) {
    console.error('Error creating test child:', error);
    process.exit(1);
  }
}

createTestChild();