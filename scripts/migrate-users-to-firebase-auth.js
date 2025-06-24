/**
 * Script to migrate existing Firestore users to Firebase Auth
 * 
 * This script creates Firebase Auth accounts for all users in the Firestore users collection
 * that don't already have Firebase Auth accounts.
 * 
 * Usage:
 * node scripts/migrate-users-to-firebase-auth.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
    clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

async function migrateUsers() {
  try {
    console.log('Starting user migration...');
    
    // Get all users from Firestore
    const usersSnapshot = await admin.firestore().collection('users').get();
    console.log(`Found ${usersSnapshot.size} users in Firestore`);
    
    const results = {
      success: [],
      alreadyExists: [],
      failed: []
    };
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const email = userData.email;
      
      if (!email) {
        console.log(`Skipping user ${userId} - no email address`);
        results.failed.push({ id: userId, reason: 'No email address' });
        continue;
      }
      
      try {
        // Check if user already exists in Firebase Auth
        try {
          await admin.auth().getUserByEmail(email);
          console.log(`User ${email} already exists in Firebase Auth`);
          results.alreadyExists.push({ id: userId, email });
          continue;
        } catch (error) {
          if (error.code !== 'auth/user-not-found') {
            throw error;
          }
        }
        
        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
          uid: userId,
          email: email,
          password: 'demo123', // Temporary password
          displayName: userData.displayName || userData.firstName + ' ' + userData.lastName || email.split('@')[0],
          emailVerified: true,
        });
        
        // Set custom claims for role-based access
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          role: userData.role || 'parent',
          roles: userData.roles || [userData.role || 'parent']
        });
        
        console.log(`Created Firebase Auth user for ${email} with role ${userData.role || 'parent'}`);
        results.success.push({ id: userId, email, role: userData.role || 'parent' });
      } catch (error) {
        console.error(`Failed to create Firebase Auth user for ${email}:`, error);
        results.failed.push({ id: userId, email, error: error.message });
      }
    }
    
    // Write results to file
    const resultsFile = path.join(__dirname, 'migration-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    console.log('\nMigration complete!');
    console.log(`Success: ${results.success.length}`);
    console.log(`Already exists: ${results.alreadyExists.length}`);
    console.log(`Failed: ${results.failed.length}`);
    console.log(`Results written to ${resultsFile}`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateUsers().catch(console.error);