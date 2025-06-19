// Script to create admin and test users in Firebase
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
});

const auth = admin.auth();
const db = admin.firestore();

// Admin email to use for all roles
const ADMIN_EMAIL = 'info@unamifoundation.org';
const ADMIN_PASSWORD = 'Proof321#';
const AVAILABLE_ROLES = ['admin', 'parent', 'school', 'authority'];

// Create admin user with different roles
async function setupAdminWithRoles() {
  try {
    // Check if admin user exists
    let adminUser;
    try {
      adminUser = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log(`Admin user ${ADMIN_EMAIL} already exists, updating...`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create admin user
        console.log(`Creating admin user: ${ADMIN_EMAIL}`);
        adminUser = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: 'Admin User',
        });
      } else {
        throw error;
      }
    }
    
    // Set custom claims for admin
    await auth.setCustomUserClaims(adminUser.uid, { 
      role: 'admin',
      roles: AVAILABLE_ROLES
    });
    
    // Create/update admin profile in Firestore
    await db.collection('users').doc(adminUser.uid).set({
      id: adminUser.uid,
      email: ADMIN_EMAIL,
      displayName: 'Admin User',
      role: 'admin',
      roles: AVAILABLE_ROLES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }, { merge: true });
    
    console.log(`Successfully set up admin user: ${ADMIN_EMAIL} with roles: ${AVAILABLE_ROLES.join(', ')}`);
    return adminUser;
  } catch (error) {
    console.error(`Error setting up admin user ${ADMIN_EMAIL}:`, error);
    throw error;
  }
}

async function main() {
  try {
    await setupAdminWithRoles();
    console.log('Admin user setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

main();