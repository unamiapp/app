/**
 * Firebase Admin SDK Singleton
 * 
 * This file provides a singleton instance of the Firebase Admin SDK to prevent
 * multiple initializations across the application. All API routes should import
 * from this file to ensure consistent access to Firebase services.
 */

import * as admin from 'firebase-admin';

// Define a class to manage the Firebase Admin SDK instance
class FirebaseAdminSingleton {
  private static instance: FirebaseAdminSingleton;
  private initialized = false;
  
  public adminAuth: admin.auth.Auth;
  public adminDb: admin.firestore.Firestore;
  public adminStorage: admin.storage.Storage;
  
  private constructor() {
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
        this.initialized = true;
      } catch (error) {
        console.error('Firebase Admin SDK initialization error:', error);
        throw error;
      }
    } else {
      console.log('Using existing Firebase Admin SDK instance');
      this.initialized = true;
    }
    
    this.adminAuth = admin.auth();
    this.adminDb = admin.firestore();
    this.adminStorage = admin.storage();
  }
  
  public static getInstance(): FirebaseAdminSingleton {
    if (!FirebaseAdminSingleton.instance) {
      FirebaseAdminSingleton.instance = new FirebaseAdminSingleton();
    }
    
    return FirebaseAdminSingleton.instance;
  }
  
  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Export a singleton instance
const firebaseAdmin = FirebaseAdminSingleton.getInstance();

// Export the admin services
export const adminAuth = firebaseAdmin.adminAuth;
export const adminDb = firebaseAdmin.adminDb;
export const adminStorage = firebaseAdmin.adminStorage;

// Export a function to check if the SDK is initialized
export const isFirebaseAdminInitialized = (): boolean => {
  return firebaseAdmin.isInitialized();
};

// Export the singleton instance for advanced use cases
export default firebaseAdmin;