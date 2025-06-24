/**
 * Script to fix Firebase Admin SDK initialization
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK directly
try {
  console.log('Initializing Firebase Admin SDK...');
  
  // Get the private key from environment variable
  let privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;
  
  // Handle different private key formats
  if (privateKey) {
    // Replace escaped newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Remove quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    
    console.log('Private key format check:', {
      startsWithHeader: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
      endsWithFooter: privateKey.includes('-----END PRIVATE KEY-----'),
      length: privateKey.length
    });
  }
  
  // Create service account object
  const serviceAccount = {
    projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
    clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: privateKey,
  };
  
  console.log('Service account config:', {
    projectId: serviceAccount.projectId ? 'SET' : 'MISSING',
    clientEmail: serviceAccount.clientEmail ? 'SET' : 'MISSING',
    privateKey: serviceAccount.privateKey ? `SET (${serviceAccount.privateKey.length} chars)` : 'MISSING'
  });
  
  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
  });
  
  console.log('Firebase Admin SDK initialized successfully');
  
  // Test Firestore connection
  async function testFirestore() {
    try {
      console.log('Testing Firestore connection...');
      const db = admin.firestore();
      
      // List collections
      const collections = await db.listCollections();
      console.log(`Found ${collections.length} collections:`);
      
      for (const collection of collections) {
        console.log(`- ${collection.id}`);
      }
      
      // Try to get a document from users collection
      const usersSnapshot = await db.collection('users').limit(1).get();
      console.log(`Users collection has ${usersSnapshot.size} documents`);
      
      console.log('Firestore connection test successful');
    } catch (error) {
      console.error('Firestore connection test failed:', error);
    }
  }
  
  // Run the test
  testFirestore();
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}