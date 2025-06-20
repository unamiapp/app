import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    
    if (id) {
      console.log(`Debug API: Fetching user with ID: ${id}`);
      
      // Get user by ID
      const userDoc = await adminDb.collection('users').doc(id).get();
      
      if (!userDoc.exists) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      const user = {
        id: userDoc.id,
        ...userDoc.data()
      };
      
      return NextResponse.json({ 
        success: true, 
        user 
      });
    } else if (email) {
      console.log(`Debug API: Fetching user with email: ${email}`);
      
      // Get user by email
      const snapshot = await adminDb.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return NextResponse.json({ 
          success: false, 
          error: 'User not found' 
        }, { status: 404 });
      }
      
      const userDoc = snapshot.docs[0];
      const user = {
        id: userDoc.id,
        ...userDoc.data()
      };
      
      return NextResponse.json({ 
        success: true, 
        user 
      });
    } else {
      console.log('Debug API: Fetching all users');
      
      // Get all users
      const snapshot = await adminDb.collection('users').get();
      
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return NextResponse.json({ 
        success: true, 
        count: users.length,
        users 
      });
    }
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch user(s)',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    console.log(`Debug API: Updating user with ID: ${id}`);
    
    // Check if user exists
    const userDoc = await adminDb.collection('users').doc(id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Get the request body
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
    await adminDb.collection('users').doc(id).update(updateData);
    
    // Get the updated user
    const updatedUserDoc = await adminDb.collection('users').doc(id).get();
    
    const updatedUser = {
      id: updatedUserDoc.id,
      ...updatedUserDoc.data()
    };
    
    return NextResponse.json({ 
      success: true, 
      user: updatedUser
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}