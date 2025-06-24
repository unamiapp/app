/**
 * Firebase Admin SDK Singleton
 * 
 * This file provides a singleton instance of the Firebase Admin SDK to prevent
 * multiple initializations across the application. All API routes should import
 * from this file to ensure consistent access to Firebase services.
 */

import * as admin from 'firebase-admin';

// Define a global variable to track initialization across module reloads
// This helps prevent duplicate initializations in development with hot reloading
declare global {
  var _firebaseAdminInitialized: boolean;
  var _firebaseAdminApp: admin.app.App;
  var _firebaseAdminAuth: admin.auth.Auth;
  var _firebaseAdminDb: admin.firestore.Firestore;
  var _firebaseAdminStorage: admin.storage.Storage;
}

// Define a class to manage the Firebase Admin SDK instance
class FirebaseAdminSingleton {
  private static instance: FirebaseAdminSingleton;
  private initialized = false;
  
  public adminAuth: admin.auth.Auth;
  public adminDb: admin.firestore.Firestore;
  public adminStorage: admin.storage.Storage;
  
  private constructor() {
    // Check if we've already initialized Firebase Admin SDK globally
    if (!global._firebaseAdminInitialized) {
      try {
        // Check if we have any existing apps
        if (!admin.apps.length) {
          // Use a service account directly for more reliable initialization
          let privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;
          
          // Handle different private key formats
          if (privateKey) {
            // Replace escaped newlines
            privateKey = privateKey.replace(/\\n/g, '\n');
            
            // Remove quotes if present
            if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
              privateKey = privateKey.substring(1, privateKey.length - 1);
            }
            
            // Ensure proper PEM format
            if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
              console.error('Private key does not appear to be in PEM format');
              // Try to fix common issues with private key format
              if (!privateKey.startsWith('-----')) {
                privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
                console.log('Attempted to fix private key format');
              }
            }
            
            console.log('Private key format check:', {
              startsWithHeader: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
              endsWithFooter: privateKey.includes('-----END PRIVATE KEY-----'),
              length: privateKey.length
            });
          }
          
          const serviceAccount = {
            projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
            clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
            privateKey: privateKey,
            private_key: privateKey, // Add alternative key name for compatibility
          };
          
          console.log('Service account config:', {
            projectId: serviceAccount.projectId ? 'SET' : 'MISSING',
            clientEmail: serviceAccount.clientEmail ? 'SET' : 'MISSING',
            privateKey: serviceAccount.privateKey ? `SET (${serviceAccount.privateKey.length} chars)` : 'MISSING'
          });

          // Initialize the app
          global._firebaseAdminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
            databaseURL: `https://${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.firebaseio.com`,
          });
          
          // Initialize services
          global._firebaseAdminAuth = admin.auth();
          global._firebaseAdminDb = admin.firestore();
          global._firebaseAdminStorage = admin.storage();
          
          // Mark as initialized
          global._firebaseAdminInitialized = true;
          
          console.log('Firebase Admin SDK initialized successfully');
        } else {
          // Use existing app
          global._firebaseAdminApp = admin.app();
          global._firebaseAdminAuth = admin.auth();
          global._firebaseAdminDb = admin.firestore();
          global._firebaseAdminStorage = admin.storage();
          global._firebaseAdminInitialized = true;
          
          console.log('Using existing Firebase Admin SDK instance');
        }
        
        this.initialized = true;
      } catch (error) {
        console.error('Firebase Admin SDK initialization error:', error);
        this.initialized = false;
        throw error;
      }
    } else {
      // Use the globally cached instances
      console.log('Using cached Firebase Admin SDK instance');
      this.initialized = true;
    }
    
    // Set the class properties to use the global instances
    this.adminAuth = global._firebaseAdminAuth || admin.auth();
    this.adminDb = global._firebaseAdminDb || admin.firestore();
    this.adminStorage = global._firebaseAdminStorage || admin.storage();
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