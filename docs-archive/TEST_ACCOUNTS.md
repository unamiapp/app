# Test Accounts for UNCIP App

This document provides information about the test accounts available for testing different roles in the UNCIP application.

## Available Test Accounts

The application supports the following test accounts with different roles:

| Email | Role | Password | Description |
|-------|------|----------|-------------|
| `info@unamifoundation.org` | Admin | Any password (6+ chars) | Official admin account |
| `parent@example.com` | Parent | Any password (6+ chars) | Test parent account |
| `school@example.com` | School | Any password (6+ chars) | Test school account |
| `authority@example.com` | Authority | Any password (6+ chars) | Test authority account |
| `community@example.com` | Community | Any password (6+ chars) | Test community leader account |

## How Test Accounts Work

The application has special handling for test accounts:

1. When you log in with any of these test emails, the system will:
   - Create a Firebase user if it doesn't exist
   - Assign the appropriate role based on the email prefix
   - Store the user information in Firestore

2. For convenience, the login page provides buttons to automatically fill in credentials for different roles.

3. The test accounts have full access to their role-specific features:
   - Parent accounts can create and manage child profiles
   - School accounts can view children associated with their school
   - Authority accounts can view alerts and respond to them
   - Admin accounts have access to all features

## Important Notes

- These test accounts are intended for development and testing purposes only
- In production, real email verification would be required
- The system ensures consistent user IDs between Firebase Auth and Firestore
- Test accounts created with `@example.com` domain will always have the role matching their email prefix

## Using Test Accounts for Development

When developing new features, you can use these test accounts to verify role-based access control and functionality. The system will maintain consistent user IDs and roles across sessions, allowing you to build up test data associated with each account.