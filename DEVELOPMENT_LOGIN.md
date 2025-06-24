# Development Login Guide

## Accessing Your Development Data

If you created data during development and need to access it in the production environment, follow these instructions:

### Login Instructions

1. Go to https://uncip.app/auth/login
2. Enter your registered email address
3. Use the development password: `demo123`
4. Select your role (parent, school, authority)
5. Click "Sign in"

### Why This Works

The application is configured to allow login with the development password (`demo123`) for any registered user in the Firestore database. This ensures you can access your development data without needing to remember specific passwords.

### Data Access

Once logged in, you'll have access to:
- All children profiles you created
- All alerts you created
- Any other data associated with your user account

### Security Note

This development password is temporary and should be replaced with proper user authentication in the future. For now, it allows seamless access to your development data in the production environment.

## Troubleshooting

If you're unable to log in:

1. Verify your email is correctly entered
2. Make sure you're using `demo123` as the password
3. Check that you've selected the correct role
4. If still having issues, contact the administrator

## Next Steps

In the future, we'll implement:
1. Proper password reset functionality
2. Migration to Firebase Auth for all users
3. Enhanced security measures