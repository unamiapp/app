# UNCIP App - Implementation Plan

## Priority Issues to Fix

Based on the analysis of the current codebase, the following issues need to be addressed for a successful production rollout:

1. Children page 404 error in parent dashboard
2. Photo upload functionality not working
3. Authentication issues with Firebase Admin SDK
4. Firebase Storage rules configuration

## 1. Fix Children Page 404 Error

### Current Issue
The parent dashboard children page is experiencing 404 errors due to conflicts in Firebase Admin SDK initialization and issues with the useChildren hook.

### Implementation Steps

1. **Update Parent Dashboard Children Page**
   - The current implementation in `/src/app/dashboard/parent/children/page.tsx` is already using the debug API endpoint directly, which is the correct approach.
   - Ensure that the page is properly exported and accessible via the correct route.
   - Check for any routing issues in the Next.js configuration.

2. **Fix Child Profile Form**
   - The ChildProfileForm component in `/src/components/forms/ChildProfileForm.tsx` is already using the debug API endpoint for CRUD operations, which is correct.
   - Ensure that the form is properly handling errors and providing feedback to users.

3. **Update Add Child Page**
   - The add child page in `/src/app/dashboard/parent/children/add/page.tsx` is using the useChildren hook, which may be causing issues.
   - Update the page to use the debug API endpoint directly instead of the useChildren hook.
   - Replace the createChild function call with a direct fetch to `/api/debug/children`.

4. **Fix Edit Child Page**
   - Create or update the edit child page to use the debug API endpoint directly.
   - Ensure that the page is properly handling errors and providing feedback to users.

## 2. Fix Photo Upload Functionality

### Current Issue
Photo upload for child profiles is not working due to Firebase Storage permission issues and inconsistent implementation.

### Implementation Steps

1. **Update PhotoUpload Component**
   - The PhotoUpload component in `/src/components/ui/PhotoUpload.tsx` is already using the debug API endpoint, which is correct.
   - Ensure that the component is properly handling errors and providing feedback to users.
   - Add additional error handling for network issues and file size limits.

2. **Update Child Profile Form**
   - Ensure that the ChildProfileForm component is correctly using the PhotoUpload component.
   - Verify that the photoURL is being properly passed to the API endpoint.

3. **Update Add Child Page**
   - Replace the direct file upload code in the add child page with the PhotoUpload component.
   - Ensure that the photoURL is being properly passed to the API endpoint.

4. **Test Photo Upload**
   - Test the photo upload functionality with various file types and sizes.
   - Verify that the uploaded photos are accessible and displayed correctly.

## 3. Fix Authentication Issues

### Current Issue
Multiple initializations of the Firebase Admin SDK are causing authentication conflicts.

### Implementation Steps

1. **Centralize Firebase Admin SDK**
   - The Firebase Admin SDK is already centralized in `/src/lib/firebase/admin.ts`, which is correct.
   - Ensure that all API routes are importing from this file.

2. **Update API Routes**
   - Check all API routes to ensure they are using the centralized Firebase Admin SDK.
   - Update any routes that are still using direct Firebase access.

3. **Fix Role-Based Access Control**
   - Ensure that all API routes are properly checking user roles.
   - Implement consistent role-based access control across all routes.

4. **Test Authentication**
   - Test authentication across all dashboards and API routes.
   - Verify that role-based access control is working correctly.

## 4. Update Firebase Rules

### Current Issue
Firebase Storage rules are not properly configured for client-side access.

### Implementation Steps

1. **Update Storage Rules**
   - Update the Firebase Storage rules in `/src/lib/firebase/storage.rules` to use the same role checking mechanism as the Firestore rules.
   - Replace `request.auth.token.role` with a proper check against the user's role in Firestore.

2. **Deploy Rules**
   - Deploy the updated rules to Firebase using the deploy script.
   - Verify that the rules are properly deployed and working.

3. **Test Rules**
   - Test the rules by attempting to access Firebase Storage from different user roles.
   - Verify that the rules are properly enforcing access control.

## Testing Plan

### 1. Children Page Testing
- Navigate to `/dashboard/parent/children` and verify that the page loads correctly.
- Create a new child profile and verify it appears in the list.
- Edit an existing child profile and verify the changes are saved.
- Delete a child profile and verify it is removed from the list.

### 2. Photo Upload Testing
- Create a new child profile with a photo and verify the upload works.
- Edit an existing child profile and change the photo.
- Remove a photo and verify it is deleted from storage.

### 3. Authentication Testing
- Log in as different user roles and verify access to appropriate dashboards.
- Test role-based access control by attempting to access restricted pages.
- Verify that API routes enforce proper authentication.

### 4. Rules Testing
- Test Firebase Storage access from different user roles.
- Verify that the rules are properly enforcing access control.

## Implementation Timeline

1. **Day 1: Fix Children Page**
   - Update parent dashboard children page
   - Fix child profile form
   - Update add child page
   - Create or update edit child page

2. **Day 2: Fix Photo Upload**
   - Update PhotoUpload component
   - Update child profile form
   - Update add child page
   - Test photo upload functionality

3. **Day 3: Fix Authentication and Rules**
   - Update API routes
   - Fix role-based access control
   - Update Firebase Storage rules
   - Deploy and test rules

4. **Day 4: Testing and Documentation**
   - Comprehensive testing of all fixed components
   - Document changes and update implementation summary
   - Create user guides for the fixed functionality