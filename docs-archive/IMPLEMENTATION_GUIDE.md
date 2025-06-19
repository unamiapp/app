# UNCIP App Implementation Guide

This guide provides instructions for implementing the security fixes and enhancements to the UNCIP App.

## 1. Setup Environment

Ensure you have the following environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ncip-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ncip-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ncip-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies, including the newly added `encoding` package to fix the node-fetch warning.

## 3. Deploy Firebase Security Rules

```bash
./deploy-firebase-rules.sh
```

This script will deploy the Firestore and Storage security rules to your Firebase project.

## 4. Seed Resources Collection

To populate the resources collection with sample data:

```bash
node src/scripts/seed-resources.js
```

## 5. Fix React Context Issues

The React context provider issues have been fixed by:

1. Creating a consolidated `client-providers.tsx` component
2. Updating the root layout to use this component
3. Ensuring proper separation of client and server components

## 6. Security Enhancements

The following security enhancements have been implemented:

1. **Custom Claims**: Firebase Auth custom claims are now set for users to support role-based security rules
2. **Firestore Rules**: Comprehensive security rules with proper field references
3. **Storage Rules**: File size limits and role-based access for uploaded files
4. **Firestore Indexes**: Optimized indexes for efficient queries

## 7. Testing

### Authentication Testing

1. Register a new user with each role (parent, school, authority, community)
2. Verify that custom claims are properly set
3. Test access to different dashboard sections based on role

### Child Profile Testing

1. Create a child profile as a parent user
2. Verify that the profile is properly stored in Firestore
3. Test file uploads for child photos

### Resources Testing

1. Access the resources page as different user roles
2. Verify that resources are properly displayed
3. Test resource filtering and search functionality

## 8. Troubleshooting

### React Context Warnings

If you still see React context warnings, check for:

1. Multiple instances of the same context provider
2. Context providers used in both client and server components

### Firebase Authentication Issues

If authentication is not working properly:

1. Check that custom claims are being set
2. Verify that the Firebase project is properly configured
3. Ensure that the environment variables are correctly set

### File Upload Issues

If file uploads are failing:

1. Check the Storage rules
2. Verify that the file path construction matches the rules
3. Ensure that the user has the proper role for the operation