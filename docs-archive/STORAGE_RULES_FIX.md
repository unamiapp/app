# Firebase Storage Rules Fix

## Issue
The Firebase Storage rules deployment failed with compilation errors:

```
Error: Compilation errors in storage.rules:
[E] 38:11 - Missing 'match' keyword before path.
[E] 38:33 - Unexpected '-'.
[E] 38:33 - Unexpected '-'.
[E] 38:35 - Unexpected 'timestamp'.
[E] 38:45 - Unexpected '-'.
[E] 38:57 - Unexpected '{'.
[E] 48:5 - Unexpected 'match'.
```

## Root Cause
Firebase Storage rules don't support complex path patterns with multiple capture groups separated by hyphens. The original rules were using patterns like:

```
match /child-images/{userId}-{timestamp}-{filename} {
```

This syntax is not valid in Storage rules.

## Solution
I've updated the Storage rules to use simpler path patterns and rely on string matching for validation:

```
match /child-images/{filename} {
  allow update: if isSignedIn() && filename.matches(request.auth.uid + '.*');
  allow delete: if isSignedIn() && (filename.matches(request.auth.uid + '.*') || isAdmin());
}
```

## Implementation Details

1. Changed all complex path patterns to simple `{filename}` patterns
2. Used `filename.matches()` to validate ownership based on filename prefixes
3. Maintained all the same security constraints but with valid syntax

## How to Deploy

Run the deployment script again:

```bash
npm run deploy:rules
```

## File Naming Convention

To maintain security with the new rules, ensure files are named with the following convention:

- Child images: `userId_timestamp_originalname.ext`
- Alert images: `userId_timestamp_originalname.ext`
- Profile images: `userId_timestamp_originalname.ext`
- School logos: `schoolId_timestamp_originalname.ext`

Update the `useStorage` hook to follow this naming convention when uploading files.