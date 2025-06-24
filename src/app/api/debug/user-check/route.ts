import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email parameter required' 
      }, { status: 400 });
    }
    
    // Find user by email
    const usersSnapshot = await adminDb.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if password exists and mask it
    const hasPassword = !!userData.password;
    const passwordInfo = hasPassword ? {
      exists: true,
      length: userData.password.length,
      firstChar: userData.password.charAt(0),
      lastChar: userData.password.charAt(userData.password.length - 1)
    } : { exists: false };
    
    // Return user data with masked password
    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        roles: userData.roles,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: passwordInfo,
        // Include other fields but exclude sensitive data
        hasProfile: !!userData.profile,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    });
  } catch (error) {
    console.error('User check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check user',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}