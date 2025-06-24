import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

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
    
    try {
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
      
      console.log('File uploaded successfully:', fullPath);
      
      return NextResponse.json({ 
        success: true, 
        url,
        path: fullPath,
        fileName: finalFileName
      });
    } catch (storageError) {
      console.error('Firebase Storage error:', storageError);
      
      // Fallback to direct URL if Firebase Storage fails
      const fallbackUrl = `/api/debug/image/${encodeURIComponent(finalFileName)}`;
      console.log('Using fallback URL:', fallbackUrl);
      
      return NextResponse.json({ 
        success: true, 
        url: fallbackUrl,
        path: fullPath,
        fileName: finalFileName,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file path provided' 
      }, { status: 400 });
    }
    
    // Delete from Firebase Storage
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(path);
    
    await fileRef.delete();
    
    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}