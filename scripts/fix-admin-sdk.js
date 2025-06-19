// Script to fix Firebase Admin SDK credentials
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

async function fixAdminSdk() {
  try {
    console.log('Fixing Firebase Admin SDK credentials...');
    
    // Create a service account file
    const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
    
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
      private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
      auth_uri: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
      token_uri: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL
    };
    
    fs.writeFileSync(serviceAccountPath, JSON.stringify(serviceAccount, null, 2));
    console.log(`Service account file created at ${serviceAccountPath}`);
    
    // Update the admin.ts file to use the service account file
    const adminTsPath = path.join(__dirname, '..', 'src', 'lib', 'firebase', 'admin.ts');
    const adminTsContent = `import * as admin from 'firebase-admin';
import serviceAccount from '../../../service-account.json';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: \`\${serviceAccount.project_id}.appspot.com\`,
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    throw error;
  }
}

// Export admin services
const adminAuth = admin.auth();
const adminDb = admin.firestore();
const adminStorage = admin.storage();

export { adminAuth, adminDb, adminStorage };`;
    
    fs.writeFileSync(adminTsPath, adminTsContent);
    console.log(`Updated ${adminTsPath}`);
    
    // Update tsconfig.json to allow importing JSON files
    const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    if (!tsconfig.compilerOptions.resolveJsonModule) {
      tsconfig.compilerOptions.resolveJsonModule = true;
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      console.log('Updated tsconfig.json to allow importing JSON files');
    }
    
    console.log('Firebase Admin SDK credentials fixed successfully!');
  } catch (error) {
    console.error('Error fixing Firebase Admin SDK credentials:', error);
    process.exit(1);
  }
}

fixAdminSdk();