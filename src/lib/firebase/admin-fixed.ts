import * as admin from 'firebase-admin';

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
const adminApp = admin.apps.length === 0 ? admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
  storageBucket: `${projectId}.appspot.com`,
}) : admin.app();

const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);
const adminStorage = admin.storage(adminApp);

console.log('Firebase Admin initialized successfully');

export { adminAuth, adminDb, adminStorage };