#!/bin/bash

# Exit on error
set -e

echo "Deploying Firebase Security Rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (non-interactive for CI environments)
if [ -n "$FIREBASE_TOKEN" ]; then
    echo "Logging in with token..."
    firebase login:ci --token "$FIREBASE_TOKEN"
else
    echo "No token found. Using interactive login..."
    firebase login
fi

# Select project
if [ -n "$FIREBASE_PROJECT_ID" ]; then
    echo "Using project: $FIREBASE_PROJECT_ID"
    firebase use "$FIREBASE_PROJECT_ID"
else
    echo "Using default project from .firebaserc..."
fi

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Storage rules
echo "Deploying Storage rules..."
firebase deploy --only storage

echo "Deployment complete!"