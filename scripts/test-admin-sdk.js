// Script to test Firebase Admin SDK connection
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

async function testAdminSdk() {
  try {
    console.log('Testing Firebase Admin SDK connection...');
    
    // Test Auth
    console.log('\nTesting Firebase Auth:');
    try {
      const listUsers = await admin.auth().listUsers(1);
      console.log(`Auth connection successful. Found ${listUsers.users.length} users.`);
    } catch (error) {
      console.error('Auth connection failed:', error);
    }
    
    // Test Firestore
    console.log('\nTesting Firestore:');
    try {
      const usersSnapshot = await admin.firestore().collection('users').limit(1).get();
      console.log(`Firestore connection successful. Found ${usersSnapshot.size} users.`);
    } catch (error) {
      console.error('Firestore connection failed:', error);
    }
    
    // Create a test document
    console.log('\nCreating test document:');
    try {
      const testDocRef = admin.firestore().collection('test_collection').doc('test_doc');
      await testDocRef.set({
        message: 'Test successful',
        timestamp: new Date().toISOString()
      });
      console.log('Test document created successfully.');
      
      // Read the test document
      const testDoc = await testDocRef.get();
      console.log('Test document data:', testDoc.data());
      
      // Delete the test document
      await testDocRef.delete();
      console.log('Test document deleted successfully.');
    } catch (error) {
      console.error('Test document operations failed:', error);
    }
    
    console.log('\nFirebase Admin SDK test completed.');
  } catch (error) {
    console.error('Error testing Firebase Admin SDK:', error);
    process.exit(1);
  }
}

testAdminSdk();