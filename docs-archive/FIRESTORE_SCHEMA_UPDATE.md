# Firestore Schema Update Guide

## Overview
This guide explains how to update the Firestore database schema to match the form structure in the application.

## Why Update the Schema?
When adding child profiles or other data to Firestore, the schema needs to match the form structure to ensure proper data storage and retrieval. This script creates schema documents in each collection to serve as a reference for the expected data structure.

## Running the Schema Update

To update the Firestore schema, run:

```bash
npm run update:schema
```

This will:
1. Connect to your Firebase project using the credentials in `.env.local`
2. Create or update schema documents in the following collections:
   - `children`
   - `resources`
   - `activities`

## Schema Structure

### Children Collection
The children collection schema includes:

```javascript
{
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  photoURL: '',
  guardians: [],
  identificationNumber: '',
  schoolName: '',
  address: {
    street: '',
    city: '',
    province: '',
    postalCode: ''
  },
  medicalInfo: {
    bloodType: '',
    allergies: [],
    conditions: [],
    medications: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  },
  createdAt: '',
  updatedAt: '',
  createdBy: ''
}
```

### Resources Collection
The resources collection schema includes:

```javascript
{
  title: '',
  description: '',
  category: '',
  content: '',
  imageURL: '',
  documentURL: '',
  contactInfo: {
    name: '',
    phone: '',
    email: '',
    website: ''
  },
  isPublished: false,
  createdAt: '',
  updatedAt: '',
  createdBy: ''
}
```

### Activities Collection
The activities collection schema includes:

```javascript
{
  type: '',
  title: '',
  description: '',
  userId: '',
  timestamp: '',
  status: '',
  metadata: {}
}
```

## Troubleshooting

If you encounter errors when running the schema update:

1. **Authentication Issues**: Make sure your Firebase Admin credentials are correctly set in `.env.local`
2. **Permission Issues**: Ensure the service account has the necessary permissions to write to Firestore
3. **Connection Issues**: Check your internet connection and Firebase project status

For more help, refer to the Firebase documentation:
- [Firestore Documentation](https://firebase.google.com/docs/firestore)