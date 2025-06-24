import * as admin from 'firebase-admin';

// Simple Firebase Admin initialization without complex singleton pattern
let adminApp: admin.app.App | null = null;
let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;
let adminStorage: admin.storage.Storage | null = null;

function initializeFirebase() {
  if (adminApp) return;

  try {
    // Get environment variables
    const projectId = process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase service account credentials');
    }

    // Fix private key formatting
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Initialize Firebase Admin
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: `${projectId}.appspot.com`,
    });

    adminAuth = admin.auth(adminApp);
    adminDb = admin.firestore(adminApp);
    adminStorage = admin.storage(adminApp);

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    throw error;
  }
}

// Initialize on import
initializeFirebase();

export { adminAuth, adminDb, adminStorage };