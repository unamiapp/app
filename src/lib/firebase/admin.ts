/**
 * Firebase Admin SDK
 * 
 * This file re-exports the Firebase Admin SDK services from the singleton implementation.
 * All API routes should import from this file to ensure consistent access to Firebase services.
 */

// Import from the singleton implementation
import { adminAuth, adminDb, adminStorage, isFirebaseAdminInitialized } from './admin-singleton';

// Log the initialization status
console.log(`Firebase Admin SDK initialized: ${isFirebaseAdminInitialized()}`);

// Export admin services
export { adminAuth, adminDb, adminStorage };