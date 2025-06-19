// Script to deploy Firebase rules
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'ignore' });
  console.log('Firebase CLI is installed.');
} catch (error) {
  console.error('Firebase CLI is not installed. Installing...');
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log('Firebase CLI installed successfully.');
  } catch (installError) {
    console.error('Failed to install Firebase CLI:', installError.message);
    process.exit(1);
  }
}

// Deploy Firestore rules
console.log('Deploying Firestore rules...');
try {
  const firestoreRules = fs.readFileSync(
    path.join(__dirname, 'firestore-rules.txt'),
    'utf8'
  );
  
  // Create temporary firestore.rules file
  fs.writeFileSync(path.join(process.cwd(), 'firestore.rules'), firestoreRules);
  
  // Deploy rules
  try {
    execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
    console.log('Firestore rules deployed successfully.');
  } catch (deployError) {
    console.error('Failed to deploy Firestore rules. You may need to initialize Firebase first with: firebase init firestore');
  }
  
  // Clean up
  if (fs.existsSync(path.join(process.cwd(), 'firestore.rules'))) {
    fs.unlinkSync(path.join(process.cwd(), 'firestore.rules'));
  }
} catch (error) {
  console.error('Failed to process Firestore rules:', error.message);
}

// Check if Storage is set up
console.log('Checking Firebase Storage setup...');
try {
  execSync('firebase projects:list', { stdio: 'ignore' });
  console.log('Firebase project is available. Attempting to deploy Storage rules...');
  
  const storageRules = fs.readFileSync(
    path.join(__dirname, 'storage-rules.txt'),
    'utf8'
  );
  
  // Create temporary storage.rules file
  fs.writeFileSync(path.join(process.cwd(), 'storage.rules'), storageRules);
  
  // Deploy rules
  try {
    execSync('firebase deploy --only storage', { stdio: 'inherit' });
    console.log('Storage rules deployed successfully.');
  } catch (deployError) {
    console.error('Failed to deploy Storage rules. You need to set up Firebase Storage first:');
    console.error('1. Go to https://console.firebase.google.com/project/ncip-app/storage');
    console.error('2. Click "Get Started" to set up Firebase Storage');
    console.error('3. After setup, run this script again');
  }
  
  // Clean up
  if (fs.existsSync(path.join(process.cwd(), 'storage.rules'))) {
    fs.unlinkSync(path.join(process.cwd(), 'storage.rules'));
  }
} catch (error) {
  console.error('Failed to check Firebase project:', error.message);
}

console.log('Rules deployment process completed.');