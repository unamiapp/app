/**
 * Script to check Firebase Auth users and compare with Firestore users
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

async function checkUsers() {
  try {
    console.log('Checking Firebase Auth users...');
    
    // Get all users from Firebase Auth
    const authUsers = [];
    let nextPageToken;
    
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      authUsers.push(...listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`Found ${authUsers.length} users in Firebase Auth`);
    
    // Get all users from Firestore
    const usersSnapshot = await admin.firestore().collection('users').get();
    console.log(`Found ${usersSnapshot.size} users in Firestore`);
    
    // Create maps for comparison
    const authUserMap = new Map();
    authUsers.forEach(user => {
      authUserMap.set(user.email.toLowerCase(), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        customClaims: user.customClaims || {}
      });
    });
    
    const firestoreUserMap = new Map();
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.email) {
        firestoreUserMap.set(userData.email.toLowerCase(), {
          id: doc.id,
          email: userData.email,
          role: userData.role,
          hasPassword: !!userData.password
        });
      }
    });
    
    // Compare users
    const results = {
      inBoth: [],
      onlyInAuth: [],
      onlyInFirestore: [],
      mismatchedIds: []
    };
    
    // Check users in both systems
    for (const [email, authUser] of authUserMap.entries()) {
      const firestoreUser = firestoreUserMap.get(email);
      
      if (firestoreUser) {
        if (authUser.uid !== firestoreUser.id) {
          results.mismatchedIds.push({
            email,
            authUid: authUser.uid,
            firestoreId: firestoreUser.id
          });
        } else {
          results.inBoth.push({
            email,
            id: authUser.uid,
            role: firestoreUser.role,
            authClaims: authUser.customClaims
          });
        }
      } else {
        results.onlyInAuth.push({
          email,
          uid: authUser.uid
        });
      }
    }
    
    // Check users only in Firestore
    for (const [email, firestoreUser] of firestoreUserMap.entries()) {
      if (!authUserMap.has(email)) {
        results.onlyInFirestore.push({
          email,
          id: firestoreUser.id,
          role: firestoreUser.role,
          hasPassword: firestoreUser.hasPassword
        });
      }
    }
    
    // Write results to file
    const resultsFile = path.join(__dirname, 'user-check-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    console.log('\nUser check complete!');
    console.log(`Users in both systems: ${results.inBoth.length}`);
    console.log(`Users only in Firebase Auth: ${results.onlyInAuth.length}`);
    console.log(`Users only in Firestore: ${results.onlyInFirestore.length}`);
    console.log(`Users with mismatched IDs: ${results.mismatchedIds.length}`);
    console.log(`Results written to ${resultsFile}`);
    
    // Provide guidance
    console.log('\nGuidance:');
    if (results.onlyInFirestore.length > 0) {
      console.log('- Some users exist only in Firestore and not in Firebase Auth');
      console.log('- These users can only log in with demo123 password');
      console.log('- Run the migration script to create Firebase Auth accounts for these users');
    }
    if (results.mismatchedIds.length > 0) {
      console.log('- Some users have different IDs in Firebase Auth and Firestore');
      console.log('- This can cause issues with permissions and data access');
      console.log('- Consider updating the IDs to match');
    }
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers().catch(console.error);