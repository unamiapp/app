// Firebase Connection Diagnostic Script
console.log('Firebase Environment Check:');
console.log('PROJECT_ID:', process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID ? 'SET' : 'MISSING');
console.log('CLIENT_EMAIL:', process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL ? 'SET' : 'MISSING');
console.log('PRIVATE_KEY:', process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY ? 'SET' : 'MISSING');

if (process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  console.log('Private key starts with:', process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.substring(0, 50));
  console.log('Private key length:', process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.length);
}