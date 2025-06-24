// Test script to check data access
const { adminDb } = require('./src/lib/firebase/admin-singleton');

async function testDataAccess() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test children collection
    const childrenSnapshot = await adminDb.collection('children').limit(5).get();
    console.log(`Children collection: ${childrenSnapshot.size} documents found`);
    
    if (childrenSnapshot.size > 0) {
      childrenSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Child: ${data.firstName} ${data.lastName} (ID: ${doc.id})`);
      });
    }
    
    // Test users collection
    const usersSnapshot = await adminDb.collection('users').limit(5).get();
    console.log(`Users collection: ${usersSnapshot.size} documents found`);
    
    if (usersSnapshot.size > 0) {
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`User: ${data.email} (Role: ${data.role})`);
      });
    }
    
    // Test alerts collection
    const alertsSnapshot = await adminDb.collection('alerts').limit(5).get();
    console.log(`Alerts collection: ${alertsSnapshot.size} documents found`);
    
  } catch (error) {
    console.error('Firebase connection error:', error.message);
    console.error('Full error:', error);
  }
}

testDataAccess();