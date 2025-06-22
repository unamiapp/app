// Simple script to verify environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables Check:');
console.log('---------------------------');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set ✅' : 'Not set ❌');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set ❌');
console.log('FIREBASE_SERVICE_ACCOUNT_PROJECT_ID:', process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID ? 'Set ✅' : 'Not set ❌');
console.log('---------------------------');

if (!process.env.NEXTAUTH_SECRET) {
  console.error('ERROR: NEXTAUTH_SECRET is not set. This is required for NextAuth.js to work properly.');
  console.log('Please ensure your .env.local file contains a valid NEXTAUTH_SECRET value.');
  console.log('You can generate one with: `openssl rand -base64 32` or any random string.');
}

if (!process.env.NEXTAUTH_URL) {
  console.log('NOTE: NEXTAUTH_URL is not set. This is recommended for production.');
  console.log('For development, you can set it to http://localhost:3000');
}