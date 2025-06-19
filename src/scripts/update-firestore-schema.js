// Script to update Firestore schema to match form structure
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin with service account
const serviceAccount = require('../../service-account.json');
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

async function updateFirestoreSchema() {
  try {
    console.log('Starting Firestore schema update...');
    
    // Update children collection schema
    const childrenRef = db.collection('children').doc('_schema');
    await childrenRef.set({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      photoURL: '',
      guardians: [],
      identificationNumber: '',
      schoolName: '',
      address: {
        street: '',
        city: '',
        province: '',
        postalCode: ''
      },
      medicalInfo: {
        bloodType: '',
        allergies: [],
        conditions: [],
        medications: [],
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        }
      },
      createdAt: '',
      updatedAt: '',
      createdBy: ''
    }, { merge: true });
    
    console.log('Children collection schema updated');
    
    // Update resources collection schema
    const resourcesRef = db.collection('resources').doc('_schema');
    await resourcesRef.set({
      title: '',
      description: '',
      category: '',
      content: '',
      imageURL: '',
      documentURL: '',
      contactInfo: {
        name: '',
        phone: '',
        email: '',
        website: ''
      },
      isPublished: false,
      createdAt: '',
      updatedAt: '',
      createdBy: ''
    }, { merge: true });
    
    console.log('Resources collection schema updated');
    
    // Update activities collection schema
    const activitiesRef = db.collection('activities').doc('_schema');
    await activitiesRef.set({
      type: '',
      title: '',
      description: '',
      userId: '',
      timestamp: '',
      status: '',
      metadata: {}
    }, { merge: true });
    
    console.log('Activities collection schema updated');
    
    console.log('Firestore schema update completed successfully');
  } catch (error) {
    console.error('Error updating Firestore schema:', error);
  }
}

updateFirestoreSchema();