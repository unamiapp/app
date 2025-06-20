// This file is disabled to prevent conflicts with the main admin.ts file
// Import from the main admin.ts file instead
import { adminAuth, adminDb, adminStorage } from './admin';

console.log('admin-direct.ts: Using centralized Firebase Admin SDK');

export { adminAuth, adminDb, adminStorage };