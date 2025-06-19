# Firebase Setup Guide

## Overview
This guide provides instructions for setting up Firebase for the UNCIP application, including deploying security rules and configuring Firebase services.

## Prerequisites
- Firebase account
- Firebase project created
- Firebase CLI installed (`npm install -g firebase-tools`)

## Firebase Services Setup

### 1. Authentication
Firebase Authentication is already configured in the application. To enable it in your Firebase project:

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Navigate to "Authentication" > "Sign-in method"
4. Enable "Email/Password" authentication
5. Optionally enable "Google" authentication

### 2. Firestore Database
To set up Firestore:

1. Go to the Firebase Console
2. Navigate to "Firestore Database"
3. Click "Create database"
4. Choose "Start in production mode"
5. Select a location close to your users
6. Click "Enable"

### 3. Firebase Storage
To set up Firebase Storage:

1. Go to the Firebase Console
2. Navigate to "Storage"
3. Click "Get started"
4. Choose "Start in production mode"
5. Click "Next"
6. Select a location close to your users
7. Click "Done"

## Deploying Security Rules

### Option 1: Using the Deployment Script
We've created a script to deploy Firestore and Storage rules:

```bash
npm run deploy:rules
```

This script will:
1. Check if Firebase CLI is installed
2. Deploy Firestore rules from `src/lib/firebase/firestore-rules.txt`
3. Deploy Storage rules from `src/lib/firebase/storage-rules.txt`

### Option 2: Manual Deployment

#### Firestore Rules
1. Copy the contents of `src/lib/firebase/firestore-rules.txt`
2. Go to Firebase Console > Firestore Database > Rules
3. Paste the rules and click "Publish"

#### Storage Rules
1. Copy the contents of `src/lib/firebase/storage-rules.txt`
2. Go to Firebase Console > Storage > Rules
3. Paste the rules and click "Publish"

## Environment Variables

Update your `.env.local` file with your Firebase project configuration:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
```

## Troubleshooting

### Common Issues

1. **"Firebase Storage has not been set up"**
   - Solution: Follow the Firebase Storage setup steps above

2. **"Compilation errors in firestore rules"**
   - Solution: Check for syntax errors in your rules file. Firestore rules have specific syntax requirements.

3. **"Permission denied" when deploying rules**
   - Solution: Make sure you're logged in with the correct Firebase account:
     ```bash
     firebase login --reauth
     ```

4. **"Error: Failed to get Firebase project"**
   - Solution: Make sure your project exists and you have access to it:
     ```bash
     firebase projects:list
     ```

### Getting Help
If you encounter issues not covered here, refer to the Firebase documentation:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Rules](https://firebase.google.com/docs/storage/security/get-started)