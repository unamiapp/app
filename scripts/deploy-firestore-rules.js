// Script to deploy Firestore rules using the Firebase CLI
require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function deployRules() {
  try {
    console.log('Deploying Firestore rules...');
    
    // Create a temporary service account file
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
      client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
      auth_uri: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
      token_uri: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL
    };
    
    const tempServiceAccountPath = path.join(os.tmpdir(), 'firebase-service-account.json');
    fs.writeFileSync(tempServiceAccountPath, JSON.stringify(serviceAccount, null, 2));
    
    console.log(`Service account file created at: ${tempServiceAccountPath}`);
    
    // Use the Firebase CLI to deploy rules
    console.log('Running Firebase CLI to deploy rules...');
    
    // Check if Firebase CLI is installed
    try {
      execSync('firebase --version', { stdio: 'inherit' });
    } catch (error) {
      console.error('Firebase CLI is not installed. Please install it with: npm install -g firebase-tools');
      return;
    }
    
    // Login with service account
    console.log('Logging in with service account...');
    execSync(`firebase login:ci --no-localhost --json --token "${process.env.FIREBASE_TOKEN}"`, { 
      stdio: 'inherit',
      env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: tempServiceAccountPath }
    });
    
    // Deploy rules
    console.log('Deploying rules...');
    execSync('firebase deploy --only firestore:rules', { 
      stdio: 'inherit',
      env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: tempServiceAccountPath }
    });
    
    // Clean up
    fs.unlinkSync(tempServiceAccountPath);
    
    console.log('Firestore rules deployed successfully!');
  } catch (error) {
    console.error('Error deploying Firestore rules:', error);
  }
}

// Run the deployment
deployRules();