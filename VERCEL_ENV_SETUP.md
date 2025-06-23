# Vercel Environment Variables Setup

## Missing Critical Environment Variables

Your Vercel deployment is missing essential environment variables for authentication to work properly.

## Required Environment Variables

### 1. NextAuth Configuration
```bash
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=https://uncip.app
```

### 2. Firebase Admin SDK (Server-side)
```bash
FIREBASE_SERVICE_ACCOUNT_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

### 3. Optional: Google OAuth (if using Google login)
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## How to Add These to Vercel

1. Go to your Vercel dashboard
2. Select your project (uncip-app)
3. Go to Settings → Environment Variables
4. Add each variable with the correct values

## Where to Get These Values

### NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```

### Firebase Admin SDK
1. Go to Firebase Console → Project Settings
2. Service Accounts tab
3. Generate new private key
4. Use the values from the downloaded JSON file

### Firebase Project ID
- Available in your Firebase project settings
- Should match your existing NEXT_PUBLIC_FIREBASE_PROJECT_ID

## Current Issue
Without these variables:
- NextAuth cannot create secure sessions
- Firebase Admin SDK cannot authenticate
- Users get stuck on login page even after successful authentication
- Server-side authentication fails

## Quick Fix
Add these environment variables to Vercel and redeploy to fix the authentication issues.