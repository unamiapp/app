import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Use a service account directly for more reliable initialization
    const serviceAccount = {
      projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
      databaseURL: `https://${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.firebaseio.com`,
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    throw error;
  }
}

// Export admin services
const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminAuth, adminDb, adminStorage };