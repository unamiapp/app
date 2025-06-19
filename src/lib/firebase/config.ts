'use client';

// Client-side Firebase configuration
// Import Firebase only on the client side to avoid server-side issues

let auth: any;
let db: any;
let storage: any;
let app: any;

// Initialize Firebase only on the client side
if (typeof window !== 'undefined') {
  const initializeFirebase = async () => {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');
      const { getStorage } = await import('firebase/storage');

      // Use environment variables for Firebase config
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      };

      // Initialize Firebase
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      
      console.log("Firebase client initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase client:", error);
      // Continue without Firebase - NextAuth will still work for authentication
    }
  };

  // Initialize Firebase when this module is imported on the client
  initializeFirebase();
}

export { app, auth, db, storage };