/**
 * Script to check how passwords are stored in Firestore
 * 
 * This script checks if passwords are stored in plaintext or hashed format
 * and provides guidance on how to handle authentication.
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

async function checkPasswordStorage() {
  try {
    console.log('Checking password storage in Firestore users collection...');
    
    // Get all users from Firestore
    const usersSnapshot = await admin.firestore().collection('users').get();
    console.log(`Found ${usersSnapshot.size} users in Firestore`);
    
    const results = {
      totalUsers: usersSnapshot.size,
      usersWithPassword: 0,
      passwordFormats: {
        plaintext: 0,
        bcrypt: 0,
        sha: 0,
        unknown: 0
      },
      sampleUsers: []
    };
    
    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const email = userData.email;
      
      if (!email) {
        console.log(`Skipping user ${userId} - no email address`);
        continue;
      }
      
      // Check if user has password
      if (userData.password) {
        results.usersWithPassword++;
        
        // Determine password format
        const password = userData.password;
        let format = 'unknown';
        
        if (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$')) {
          format = 'bcrypt';
          results.passwordFormats.bcrypt++;
        } else if (password.length === 64 && /^[a-f0-9]+$/i.test(password)) {
          format = 'sha';
          results.passwordFormats.sha++;
        } else if (password.length < 30) {
          format = 'plaintext';
          results.passwordFormats.plaintext++;
        } else {
          results.passwordFormats.unknown++;
        }
        
        // Add sample user (first 5)
        if (results.sampleUsers.length < 5) {
          results.sampleUsers.push({
            id: userId,
            email,
            passwordFormat: format,
            passwordLength: password.length,
            passwordSample: format === 'plaintext' ? password : password.substring(0, 10) + '...'
          });
        }
      }
    }
    
    // Write results to file
    const resultsFile = path.join(__dirname, 'password-check-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    
    console.log('\nPassword check complete!');
    console.log(`Total users: ${results.totalUsers}`);
    console.log(`Users with password: ${results.usersWithPassword}`);
    console.log('Password formats:');
    console.log(`  Plaintext: ${results.passwordFormats.plaintext}`);
    console.log(`  BCrypt: ${results.passwordFormats.bcrypt}`);
    console.log(`  SHA: ${results.passwordFormats.sha}`);
    console.log(`  Unknown: ${results.passwordFormats.unknown}`);
    console.log(`Results written to ${resultsFile}`);
    
    // Provide guidance
    console.log('\nGuidance:');
    if (results.passwordFormats.plaintext > 0) {
      console.log('- Some passwords appear to be stored in plaintext');
      console.log('- The current auth.ts code should work with these passwords');
      console.log('- For security, consider hashing these passwords');
    }
    if (results.passwordFormats.bcrypt > 0 || results.passwordFormats.sha > 0) {
      console.log('- Some passwords appear to be hashed');
      console.log('- The current auth.ts code will NOT work with these passwords');
      console.log('- You need to implement proper password verification');
    }
  } catch (error) {
    console.error('Password check failed:', error);
  }
}

checkPasswordStorage().catch(console.error);