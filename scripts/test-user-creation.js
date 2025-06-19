// Script to test user and child creation functionality
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const { createUser, createChild } = require('./direct-user-creation');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
    clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID}.appspot.com`,
  });
}

// Test data
const testUsers = [
  {
    email: 'testadmin@example.com',
    password: 'Password123!',
    displayName: 'Test Admin',
    role: 'admin'
  },
  {
    email: 'testparent@example.com',
    password: 'Password123!',
    displayName: 'Test Parent',
    role: 'parent'
  },
  {
    email: 'testschool@example.com',
    password: 'Password123!',
    displayName: 'Test School',
    role: 'school',
    organization: {
      name: 'Test School',
      type: 'school'
    }
  },
  {
    email: 'testauthority@example.com',
    password: 'Password123!',
    displayName: 'Test Authority',
    role: 'authority',
    organization: {
      name: 'Test Authority',
      type: 'authority'
    }
  }
];

const testChild = {
  firstName: 'Test',
  lastName: 'Child',
  dateOfBirth: '2015-01-01',
  gender: 'female',
  identificationNumber: 'TEST123',
  schoolName: 'Test School',
  address: {
    street: '123 Test St',
    city: 'Test City',
    province: 'Test Province',
    postalCode: '12345'
  },
  medicalInfo: {
    bloodType: 'O+',
    allergies: ['Peanuts'],
    conditions: ['None'],
    emergencyContact: {
      name: 'Emergency Contact',
      relationship: 'Relative',
      phone: '123-456-7890'
    }
  }
};

// Run tests
async function runTests() {
  try {
    console.log('Starting user and child creation tests...');
    
    // Create test users
    const createdUsers = {};
    
    for (const userData of testUsers) {
      try {
        console.log(`Creating ${userData.role} user: ${userData.email}`);
        const userId = await createUser(
          userData.email,
          userData.password,
          userData.displayName,
          userData.role,
          userData.organization ? { organization: userData.organization } : {}
        );
        
        createdUsers[userData.role] = userId;
        console.log(`Successfully created ${userData.role} user with ID: ${userId}`);
      } catch (error) {
        console.error(`Failed to create ${userData.role} user:`, error);
      }
    }
    
    // Create test child for parent
    if (createdUsers.parent) {
      try {
        console.log(`Creating child for parent: ${createdUsers.parent}`);
        const childId = await createChild(createdUsers.parent, {
          ...testChild,
          guardians: [createdUsers.parent]
        });
        
        console.log(`Successfully created child with ID: ${childId}`);
      } catch (error) {
        console.error('Failed to create child:', error);
      }
    }
    
    console.log('Tests completed!');
    console.log('Created users:', createdUsers);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests();