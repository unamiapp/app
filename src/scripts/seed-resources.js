const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
  // Check if service account credentials are available as environment variables
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
  } else {
    // Try to use service account file if available
    try {
      const serviceAccount = require('../../service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (err) {
      console.error('No service account file found. Please provide credentials via environment variables.');
      process.exit(1);
    }
  }
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

// Sample resources data
const resources = [
  {
    title: 'Child Safety Guide',
    description: 'Essential safety tips for parents and guardians',
    category: 'safety',
    content: 'This comprehensive guide covers essential safety practices for children of all ages.',
    imageURL: 'https://via.placeholder.com/300',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    title: 'Emergency Contact Information',
    description: 'Important contacts for emergencies',
    category: 'emergency',
    content: 'Keep these emergency contacts handy for quick access during urgent situations.',
    contactInfo: {
      name: 'Emergency Services',
      phone: '10111',
      website: 'https://www.saps.gov.za'
    },
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    title: 'Child Health Resources',
    description: 'Health information for children',
    category: 'health',
    content: 'Information about common childhood illnesses, vaccinations, and health practices.',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

// Seed resources
async function seedResources() {
  try {
    console.log('Seeding resources collection...');
    
    // Add each resource to Firestore
    for (const resource of resources) {
      const docRef = db.collection('resources').doc();
      await docRef.set({
        id: docRef.id,
        ...resource
      });
      console.log(`Added resource: ${resource.title}`);
    }
    
    console.log('Resources seeded successfully!');
  } catch (error) {
    console.error('Error seeding resources:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedResources();