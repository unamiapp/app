// Script to create an admin user directly
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

async function createAdminUser() {
  try {
    const email = 'admin@example.com';
    const password = 'Admin123!';
    const displayName = 'Admin User';
    
    // Check if user already exists
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      console.log('User already exists:', existingUser.uid);
      
      // Set custom claims
      await admin.auth().setCustomUserClaims(existingUser.uid, { 
        role: 'admin',
        roles: ['admin']
      });
      
      console.log('Updated custom claims for existing user');
      
      // Update user in Firestore
      await admin.firestore().collection('users').doc(existingUser.uid).set({
        id: existingUser.uid,
        email: email,
        displayName: displayName,
        role: 'admin',
        roles: ['admin'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      });
      
      console.log('Updated user in Firestore');
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      disabled: false,
    });
    
    console.log('User created in Auth:', userRecord.uid);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role: 'admin',
      roles: ['admin']
    });
    
    console.log('Custom claims set for user');
    
    // Create user in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email: email,
      displayName: displayName,
      role: 'admin',
      roles: ['admin'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    });
    
    console.log('User created in Firestore');
    console.log('\nAdmin user created successfully:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('UID:', userRecord.uid);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();