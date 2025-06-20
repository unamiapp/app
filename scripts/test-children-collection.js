// Test script to check if the children collection exists and has data
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

async function testChildrenCollection() {
  try {
    const db = admin.firestore();
    
    // Check if the children collection exists and has data
    const snapshot = await db.collection('children').get();
    
    console.log(`Found ${snapshot.size} children in the collection`);
    
    if (snapshot.size > 0) {
      // Print the first child
      const firstChild = snapshot.docs[0];
      console.log('First child:', {
        id: firstChild.id,
        ...firstChild.data()
      });
      
      // Print all children IDs
      console.log('All children IDs:');
      snapshot.docs.forEach(doc => {
        console.log(`- ${doc.id}: ${doc.data().firstName} ${doc.data().lastName}`);
      });
    } else {
      console.log('No children found in the collection');
      
      // Create a test child
      console.log('Creating a test child...');
      
      const testChild = {
        firstName: 'Test',
        lastName: 'Child',
        dateOfBirth: '2020-01-01',
        gender: 'male',
        guardians: ['test-parent-id'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test-script'
      };
      
      const docRef = await db.collection('children').add(testChild);
      console.log(`Test child created with ID: ${docRef.id}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing children collection:', error);
    process.exit(1);
  }
}

testChildrenCollection();