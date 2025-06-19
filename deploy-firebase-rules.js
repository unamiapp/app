const { execSync } = require('child_process');

// This script deploys Firebase rules using a provided token
// Usage: node deploy-firebase-rules.js <FIREBASE_TOKEN>

const token = process.argv[2];

if (!token) {
  console.error('Error: Firebase token is required');
  console.error('Usage: node deploy-firebase-rules.js <FIREBASE_TOKEN>');
  process.exit(1);
}

try {
  // Deploy Firestore rules
  console.log('Deploying Firestore rules...');
  execSync(`firebase deploy --only firestore:rules --token ${token} --non-interactive`, { stdio: 'inherit' });
  
  // Deploy Storage rules
  console.log('Deploying Storage rules...');
  execSync(`firebase deploy --only storage:rules --token ${token} --non-interactive`, { stdio: 'inherit' });
  
  // Deploy Firestore indexes
  console.log('Deploying Firestore indexes...');
  execSync(`firebase deploy --only firestore:indexes --token ${token} --non-interactive`, { stdio: 'inherit' });
  
  console.log('Firebase rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Firebase rules:', error.message);
  process.exit(1);
}