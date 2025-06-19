import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK directly with environment variables
if (!admin.apps.length) {
  try {
    // Fix for private key format
    const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY 
      ? process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n') 
      : undefined;

    // Log the first few characters of the private key for debugging
    console.log('Private key starts with:', privateKey?.substring(0, 20) + '...');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
        clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
    });
    
    console.log('Firebase Admin SDK initialized successfully with direct credentials');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    throw error;
  }
}

// Test the connection
async function testConnection() {
  try {
    const auth = admin.auth();
    const db = admin.firestore();
    
    // Test Auth
    const listUsers = await auth.listUsers(1);
    console.log(`Auth connection successful. Found ${listUsers.users.length} users.`);
    
    // Test Firestore
    const usersSnapshot = await db.collection('users').limit(1).get();
    console.log(`Firestore connection successful. Found ${usersSnapshot.size} users.`);
    
    return true;
  } catch (error) {
    console.error('Firebase Admin SDK connection test failed:', error);
    return false;
  }
}

// Export admin services
const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

// Test the connection when this module is imported
testConnection();

export { adminAuth, adminDb, adminStorage };