/**
 * Script to test all debug APIs and verify which collections are accessible
 */

const fetch = require('node-fetch');
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

// Base URL for API calls
const BASE_URL = process.env.API_BASE_URL || 'https://uncip.app';

// List of debug API endpoints to test
const endpoints = [
  { name: 'Activities', path: '/api/debug/activities' },
  { name: 'Alerts', path: '/api/debug/alerts' },
  { name: 'Children', path: '/api/debug/children' },
  { name: 'Users', path: '/api/debug/users' },
  { name: 'Session', path: '/api/debug/session' },
];

// Function to test an API endpoint
async function testEndpoint(endpoint) {
  try {
    console.log(`Testing ${endpoint.name} API...`);
    const response = await fetch(`${BASE_URL}${endpoint.path}`);
    const data = await response.json();
    
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success ? 'Yes' : 'No'}`);
    
    if (data.success) {
      if (data.count !== undefined) {
        console.log(`  Count: ${data.count}`);
      }
      
      // Check what data is returned
      const keys = Object.keys(data).filter(key => 
        key !== 'success' && 
        key !== 'count' && 
        key !== 'error' && 
        key !== 'message'
      );
      
      console.log(`  Data keys: ${keys.join(', ')}`);
    } else {
      console.log(`  Error: ${data.error || 'Unknown error'}`);
      console.log(`  Message: ${data.message || 'No message'}`);
    }
    
    return { endpoint, status: response.status, data };
  } catch (error) {
    console.error(`  Error testing ${endpoint.name} API:`, error);
    return { endpoint, error: error.message };
  }
}

// Function to check Firestore collections
async function checkFirestoreCollections() {
  try {
    console.log('\nChecking Firestore collections...');
    
    const collections = await admin.firestore().listCollections();
    const collectionIds = collections.map(col => col.id);
    
    console.log(`Found ${collectionIds.length} collections:`);
    for (const id of collectionIds) {
      const snapshot = await admin.firestore().collection(id).limit(1).get();
      console.log(`  - ${id} (${snapshot.empty ? 'empty' : 'has data'})`);
    }
    
    return collectionIds;
  } catch (error) {
    console.error('Error checking Firestore collections:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('Testing debug APIs...\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(''); // Add empty line between endpoints
  }
  
  // Check Firestore collections
  const collections = await checkFirestoreCollections();
  
  // Write results to file
  const resultsFile = path.join(__dirname, 'debug-api-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({ 
    results, 
    collections,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log(`\nResults written to ${resultsFile}`);
}

main().catch(console.error);