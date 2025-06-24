# Firebase Auth Migration Guide

## Current Issue

Parents and other registered users in the Firestore database cannot log in with their registered emails because they don't have corresponding Firebase Auth accounts.

## Solution

We've implemented a two-part solution:

1. **Temporary Fix**: Allow login with demo password `demo123` for any registered user in Firestore
2. **Permanent Fix**: Migrate all Firestore users to Firebase Auth

## Migration Process

### Step 1: Run the Migration Script

```bash
# Set environment variables
export FIREBASE_SERVICE_ACCOUNT_PROJECT_ID=your-project-id
export FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL=your-service-account-email
export FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY='your-private-key'

# Run the migration script
node scripts/migrate-users-to-firebase-auth.js
```

This script will:
- Find all users in the Firestore `users` collection
- Create corresponding Firebase Auth accounts with temporary password `demo123`
- Set custom claims for role-based access control
- Generate a report of successful and failed migrations

### Step 2: Update User Passwords

After migration, users should reset their passwords:

1. Add a password reset feature to the login page
2. Send password reset emails to all migrated users
3. Users can then set their own secure passwords

## Hybrid Authentication System

Our authentication system now implements a hybrid approach:

1. **Role-Based Access Control (RBAC)**:
   - Uses Firebase Auth custom claims and session tokens
   - Controls access to different dashboards based on user role

2. **Relationship-Based Access Control (ReBAC)**:
   - Uses Firestore data relationships
   - Controls access to specific resources (e.g., children) based on relationships

## Testing the Fix

1. **Admin Login**: Use `info@unamifoundation.org` / `Proof321#`
2. **Registered Parent Login**: Use registered email with password `demo123`
3. **New Demo User**: Use any email with password `demo123`

## Production Considerations

For production deployment:
- Complete the migration of all users to Firebase Auth
- Implement proper password reset flow
- Remove the demo password fallback
- Ensure all new user registrations create both Firestore and Firebase Auth accounts