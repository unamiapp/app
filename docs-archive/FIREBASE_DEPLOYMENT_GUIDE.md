# Firebase Security Rules Deployment Guide

This guide explains how to deploy the updated security rules to your Firebase project.

## Prerequisites

1. Firebase CLI installed (`npm install -g firebase-tools`)
2. Access to the Firebase project (`ncip-app`)
3. Proper authentication with Firebase (`firebase login`)

## Deploying Storage Rules

1. Create a `storage.rules` file in your project root with the contents from `/src/lib/firebase/storage-rules.txt`

```bash
cp /src/lib/firebase/storage-rules.txt storage.rules
```

2. Update your `firebase.json` file to include storage rules:

```json
{
  "storage": {
    "rules": "storage.rules"
  }
}
```

3. Deploy the storage rules:

```bash
firebase deploy --only storage
```

## Deploying Firestore Rules

1. Create a `firestore.rules` file in your project root with the contents from `/src/lib/firebase/firestore-rules.txt`

```bash
cp /src/lib/firebase/firestore-rules.txt firestore.rules
```

2. Update your `firebase.json` file to include Firestore rules:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

3. Deploy the Firestore rules:

```bash
firebase deploy --only firestore:rules
```

## Testing Rules in the Firebase Console

1. Go to the Firebase Console: https://console.firebase.google.com/project/ncip-app
2. Navigate to Storage → Rules or Firestore → Rules
3. Use the Rules Playground to test different scenarios:
   - Test as an admin user
   - Test as a parent user
   - Test as an authority user
   - Test with invalid permissions

## Verifying Rules Deployment

After deployment, verify that the rules are working correctly:

1. Try to upload a file to Storage as a parent user
2. Try to create a child profile as a parent user
3. Try to access resources as different user roles

## Troubleshooting

If you encounter permission issues after deploying the rules:

1. Check the Firebase console logs for any rule evaluation errors
2. Verify that user custom claims are properly set
3. Ensure that the client-side code is using the correct paths and permissions
4. Test with the Firebase emulator locally before deploying to production

## Rolling Back

If the new rules cause issues, you can roll back to the previous version:

```bash
firebase deploy --only storage:rules --rollback
firebase deploy --only firestore:rules --rollback
```