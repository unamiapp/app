# Photo Upload Solution

## Issue Summary
Photo upload functionality for child profiles is not working due to Firebase Storage permission issues and inconsistent implementation across different parts of the application.

## Root Cause Analysis
1. **Firebase Storage Rules**: The storage rules are using `request.auth.token.role` for role checking, but the actual user roles are stored in Firestore.
2. **Client-Side Storage Access**: The application is attempting to access Firebase Storage directly from client components, which is failing due to permission issues.
3. **Inconsistent Implementation**: Different parts of the application are using different approaches for file uploads.

## Solution Implementation

### 1. Update PhotoUpload Component

The PhotoUpload component in `/src/components/ui/PhotoUpload.tsx` is already using the debug API endpoint, which is the correct approach. However, we should enhance it with better error handling and progress tracking.

#### Enhanced Error Handling
```typescript
// Add more detailed error handling
try {
  // Existing upload code
} catch (error) {
  console.error('Error uploading photo:', error);
  
  // More detailed error messages
  if (error instanceof Error) {
    if (error.message.includes('storage/unauthorized')) {
      toast.error('Permission denied. You do not have access to upload files.');
    } else if (error.message.includes('storage/quota-exceeded')) {
      toast.error('Storage quota exceeded. Please contact support.');
    } else {
      toast.error(`Upload failed: ${error.message}`);
    }
  } else {
    toast.error('Failed to upload photo. Please try again later.');
  }
}
```

#### Improved Progress Tracking
```typescript
// Add real progress tracking
const uploadWithProgress = async (formData) => {
  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.open('POST', '/api/debug/upload', true);
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`HTTP Error: ${xhr.status}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
};
```

### 2. Update Child Profile Form

Ensure that the ChildProfileForm component is correctly using the PhotoUpload component and handling the photoURL properly.

#### Verify PhotoUpload Integration
```typescript
// In ChildProfileForm.tsx
const [photoURL, setPhotoURL] = useState<string>(initialData?.photoURL || '');

const handlePhotoChange = (url: string) => {
  setPhotoURL(url);
};

// In the form JSX
<PhotoUpload
  initialPhotoURL={initialData?.photoURL}
  onPhotoChange={handlePhotoChange}
  path="child-photos"
  className="h-32 w-32"
/>

// When submitting the form
const childData = {
  // Other fields
  photoURL: photoURL || '',
  // Other fields
};
```

### 3. Update Add Child Page

Replace the direct file upload code in the add child page with the PhotoUpload component.

#### Replace Direct Upload with PhotoUpload
```typescript
// Replace this:
const [photoFile, setPhotoFile] = useState<File | null>(null);

// With this:
const [photoURL, setPhotoURL] = useState<string>('');

// Replace the file input and preview with:
<PhotoUpload
  onPhotoChange={(url) => setPhotoURL(url)}
  path="child-photos"
  className="h-32 w-32"
/>

// Replace the upload code in handleSubmit with:
const childData = {
  // Other fields
  photoURL: photoURL || '',
  // Other fields
};
```

### 4. Update Firebase Storage Rules

Update the Firebase Storage rules to use the same role checking mechanism as the Firestore rules.

#### Updated Storage Rules
```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Common functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Allow all authenticated server access (for admin SDK)
    match /child-photos/{filename} {
      allow read: if isSignedIn();
      // Client-side uploads are disabled, use server API instead
      allow write: if false;
    }
    
    match /profile-photos/{filename} {
      allow read: if isSignedIn();
      // Client-side uploads are disabled, use server API instead
      allow write: if false;
    }
    
    // Catch-all rule
    match /{allPaths=**} {
      // Only allow read access for authenticated users
      allow read: if isSignedIn();
      // Disable client-side writes completely
      allow write: if false;
    }
  }
}
```

### 5. Update Debug Upload API

Enhance the debug upload API with better error handling and validation.

#### Enhanced Debug Upload API
```typescript
// /src/app/api/debug/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';
    const fileName = formData.get('fileName') as string;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only image files are allowed' 
      }, { status: 400 });
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File size exceeds 5MB limit' 
      }, { status: 400 });
    }
    
    // Generate a unique file name if not provided
    const finalFileName = fileName || `${Date.now()}_${file.name}`;
    const fullPath = `${path}/${finalFileName}`;
    
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Upload to Firebase Storage
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fullPath);
    
    await fileRef.save(Buffer.from(buffer), {
      metadata: {
        contentType: file.type,
      }
    });
    
    // Get the download URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future expiration
    });
    
    // Log success for debugging
    console.log(`File uploaded successfully: ${fullPath}`);
    
    return NextResponse.json({ 
      success: true, 
      url,
      path: fullPath,
      fileName: finalFileName
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

### 6. Deploy Updated Rules

Deploy the updated Firebase Storage rules to enforce the new security model.

#### Deployment Script
```bash
#!/bin/bash
echo "Deploying Firebase Storage rules..."
firebase deploy --only storage
echo "Deployment complete!"
```

### 7. Testing Steps

1. **Test PhotoUpload Component**
   - Create a test page that uses the PhotoUpload component
   - Upload various image files (different formats and sizes)
   - Verify that the uploads succeed and the images are displayed correctly
   - Test error cases (file too large, wrong file type)

2. **Test Child Profile Form**
   - Create a new child profile with a photo
   - Verify that the photo uploads successfully and is displayed in the form
   - Edit an existing child profile and change the photo
   - Verify that the photo updates correctly

3. **Test Add Child Page**
   - Navigate to the add child page
   - Upload a photo using the PhotoUpload component
   - Complete the form and submit
   - Verify that the child is created with the correct photo

4. **Test Firebase Storage Rules**
   - Attempt to upload a file directly to Firebase Storage from the client
   - Verify that the upload is rejected due to the security rules
   - Verify that the debug API endpoint can still upload files

## Additional Recommendations

1. **Implement Image Optimization**
   - Resize large images before uploading to save storage space
   - Compress images to improve loading performance
   - Generate thumbnails for faster loading in list views

2. **Add File Type Validation**
   - Validate file types on both client and server
   - Restrict uploads to common image formats (JPEG, PNG, GIF)
   - Provide clear error messages for unsupported file types

3. **Improve User Experience**
   - Add drag-and-drop support for file uploads
   - Provide visual feedback during uploads (progress bar)
   - Show preview of uploaded images before submission

4. **Enhance Security**
   - Implement virus scanning for uploaded files
   - Set proper Content-Security-Policy headers
   - Limit upload frequency to prevent abuse