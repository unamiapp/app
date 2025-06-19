# Firebase Security Implementation

This document outlines the security implementation for the UNCIP App, focusing on Firebase Firestore and Storage security rules.

## Overview

The security implementation follows these key principles:

1. **Role-based access control** for all resources
2. **Least privilege principle** for all operations
3. **Data validation** for all write operations
4. **Resource-specific permissions** based on user roles

## User Roles

The application supports the following user roles:

- **Parent**: Can manage their children's profiles and create alerts
- **School**: Can view children associated with their school
- **Authority**: Can view and manage alerts and resources
- **Community**: Can view resources and alerts
- **Admin**: Has full access to all resources

## Authentication

Authentication is handled through Firebase Authentication with custom claims:

- Each user has a `role` claim that determines their permissions
- JWT tokens include the role for client-side verification
- Server-side validation ensures roles cannot be spoofed

## Firestore Security Rules

The Firestore security rules implement the following permissions:

### Users Collection

- Users can read and update their own profiles
- Admins can read, create, update, and delete any user profile

### Children Collection

- Parents can create child profiles and manage their own children
- Schools can view and update children associated with their school
- Authorities can view all children for emergency purposes
- Admins have full access

### Alerts Collection

- All authenticated users can read alerts
- Parents, authorities, and admins can create alerts
- Only the creator, authorities, or admins can update alerts
- Only the creator or admins can delete alerts

### Resources Collection

- All authenticated users can read resources
- Only admins and authorities can create, update, or delete resources

## Storage Security Rules

The Storage rules implement the following permissions:

### Child Images

- 5MB maximum file size
- Image file types only
- Parents can upload images for their children
- Only the owner or admin can update or delete images

### Alert Images

- 10MB maximum file size
- Image file types only
- Parents, authorities, and admins can upload alert images
- Authorities can manage alert images for emergency response

### Resource Images

- 10MB maximum file size
- Image file types only
- Only admins and authorities can manage resource images

## Deployment

To deploy the security rules:

1. Run the deployment script: `./deploy-firebase-rules.sh`
2. The script will deploy both Firestore and Storage rules
3. Verify the rules in the Firebase Console

## Testing

To test the security rules:

1. Use the Firebase Rules Playground in the Firebase Console
2. Test each role with various operations
3. Verify that unauthorized operations are rejected

## Maintenance

When updating the application:

1. Review and update security rules for any new collections or storage paths
2. Test all rules before deployment
3. Document any changes to the security model