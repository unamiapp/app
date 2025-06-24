/**
 * Firebase Admin SDK
 * 
 * This file re-exports the Firebase Admin SDK services from the singleton implementation.
 * All API routes should import from this file to ensure consistent access to Firebase services.
 */

// Import from the fixed implementation
import { adminAuth, adminDb, adminStorage } from './admin-fixed';

// Export admin services
export { adminAuth, adminDb, adminStorage };

// For backward compatibility
export const isFirebaseAdminInitialized = () => true;