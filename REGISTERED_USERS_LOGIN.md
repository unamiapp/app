# Registered Users Login Guide

## Current Authentication System

The application uses a hybrid authentication system:

1. **Firebase Auth**: For users created through Firebase Authentication
2. **Firestore Database**: For users created directly in Firestore

## Why Registered Users Can't Log In

Registered users may not be able to log in for the following reasons:

1. **Missing Firebase Auth Account**: Users created only in Firestore don't have corresponding Firebase Auth accounts
2. **Password Mismatch**: Passwords stored in Firestore may not match what users are entering
3. **ID Mismatch**: User IDs in Firestore may not match Firebase Auth UIDs

## Solution: Use Demo Password

For immediate access, all registered users can log in with:

- **Email**: Your registered email address
- **Password**: `demo123`

This works because the authentication system has a fallback that allows any user found in Firestore to log in with the demo password.

## Long-term Solution

To properly fix the authentication system:

1. **Run the User Check Script**:
   ```bash
   node scripts/check-firebase-auth-users.js
   ```
   This will identify users that exist only in Firestore.

2. **Run the Migration Script**:
   ```bash
   node scripts/migrate-users-to-firebase-auth.js
   ```
   This will create Firebase Auth accounts for all Firestore users.

3. **Implement Password Reset**:
   After migration, users should reset their passwords through a password reset flow.

## Checking User Status

Administrators can use the debug endpoint to check a user's status:

```
POST /api/debug/check-credentials
Body: { "email": "user@example.com" }
```

This will show if the user exists in Firestore and if they have a stored password.

## Firebase Identity Platform

The Firebase Identity Platform (Authentication) is enabled with Email/Password sign-in method. This is the correct configuration for the application.

All registered users should eventually have accounts in both Firestore (for data) and Firebase Auth (for authentication).