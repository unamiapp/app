# User and Child Creation Guide

This document provides instructions on how to create users and child profiles in the application.

## User Creation (Admin Only)

Only administrators can create new users in the system. The application supports the following user roles:

- **Admin**: Full system access
- **Parent**: Can create and manage child profiles
- **School**: Can view children associated with their school
- **Authority**: Can view and manage alerts
- **Community**: Limited access to community resources

### Creating a User as an Admin

1. Log in with an admin account
2. Navigate to Dashboard > Admin > Users
3. Click "Add User" button
4. Fill in the required information:
   - Email address
   - Password (minimum 8 characters)
   - Full name
   - Role
   - Additional information based on role
5. Click "Create User"

### Troubleshooting User Creation

If you encounter issues creating users:

1. Check the browser console for error messages
2. Verify that you have admin privileges
3. Ensure all required fields are filled correctly
4. Check that the email address is not already in use

## Child Profile Creation (Parents and Admins)

Only parents and administrators can create child profiles in the system.

### Creating a Child Profile as a Parent

1. Log in with a parent account
2. Navigate to Dashboard > Parent > Children
3. Click "Add Child" button
4. Fill in the required information:
   - First name
   - Last name
   - Date of birth
   - Gender
   - Optional: Photo, identification number, school name, etc.
5. Click "Save Child"

### Creating a Child Profile as an Admin

Administrators can create child profiles on behalf of parents:

1. Log in with an admin account
2. Navigate to Dashboard > Admin > Children
3. Click "Add Child" button
4. Fill in the required information, including selecting the parent(s)
5. Click "Save Child"

### Troubleshooting Child Profile Creation

If you encounter issues creating child profiles:

1. Check the browser console for error messages
2. Verify that you have parent or admin privileges
3. Ensure all required fields are filled correctly
4. Check that the child profile doesn't already exist (same name and date of birth)

## Technical Implementation

The application uses server-side API endpoints to handle user and child creation:

- `/api/admin/create-user`: Creates users with different roles (admin only)
- `/api/parent/create-child`: Creates child profiles (parent only)
- `/api/children`: Creates child profiles (admin only)

These endpoints use Firebase Admin SDK to bypass client-side permission issues and ensure proper role-based access control.

## Security Considerations

- User passwords should be strong and secure
- Child profile information is sensitive and protected by role-based access controls
- All creation operations are logged in the audit trail for security monitoring