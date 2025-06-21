import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Use type assertion for session.user since NextAuth types don't include id
    const userId = (session.user as any).id || (session.user as any).uid;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID not found in session' 
      }, { status: 400 });
    }
    
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: userDoc.id,
        ...userDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Use type assertion for session.user since NextAuth types don't include id
    const userId = (session.user as any).id || (session.user as any).uid;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID not found in session' 
      }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Fields that can be updated
    const allowedFields = ['displayName', 'photoURL', 'phone', 'address'];
    
    // Filter out fields that are not allowed to be updated
    const updateData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {} as Record<string, any>);
    
    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // Update user in Firestore
    await adminDb.collection('users').doc(userId).update(updateData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update user profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
