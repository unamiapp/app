import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
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
    
    console.log('Firebase Admin SDK initialized successfully in check API');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

// GET /api/admin-sdk/check - Check Firebase Admin SDK connection
export async function GET(request: NextRequest) {
  try {
    console.log('Checking Firebase Admin SDK connection...');
    
    const results = {
      auth: { success: false, message: '', users: 0 },
      firestore: { success: false, message: '', collections: [] as string[] },
      test: { success: false, message: '' }
    };
    
    // Test Auth
    try {
      const listUsers = await admin.auth().listUsers(1);
      results.auth = {
        success: true,
        message: 'Auth connection successful',
        users: listUsers.users.length
      };
    } catch (error: any) {
      results.auth = {
        success: false,
        message: `Auth connection failed: ${error.message}`,
        users: 0
      };
    }
    
    // Test Firestore
    try {
      const collections = await admin.firestore().listCollections();
      const collectionIds = collections.map(col => col.id);
      
      results.firestore = {
        success: true,
        message: 'Firestore connection successful',
        collections: collectionIds
      };
    } catch (error: any) {
      results.firestore = {
        success: false,
        message: `Firestore connection failed: ${error.message}`,
        collections: []
      };
    }
    
    // Create a test document
    try {
      const testDocRef = admin.firestore().collection('test_collection').doc('test_doc');
      await testDocRef.set({
        message: 'Test successful',
        timestamp: new Date().toISOString()
      });
      
      // Read the test document
      const testDoc = await testDocRef.get();
      
      // Delete the test document
      await testDocRef.delete();
      
      results.test = {
        success: true,
        message: 'Test document operations successful'
      };
    } catch (error: any) {
      results.test = {
        success: false,
        message: `Test document operations failed: ${error.message}`
      };
    }
    
    const success = results.auth.success && results.firestore.success && results.test.success;
    
    return NextResponse.json({
      success,
      message: success ? 'Firebase Admin SDK connection successful' : 'Firebase Admin SDK connection failed',
      results
    });
  } catch (error: any) {
    console.error('Error checking Firebase Admin SDK connection:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Error checking Firebase Admin SDK connection',
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}