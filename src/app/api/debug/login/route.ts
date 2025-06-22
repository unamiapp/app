import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    // Try to get the user by email
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      
      return NextResponse.json({
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
        }
      });
    } catch (error: any) {
      console.error('Error getting user by email:', error);
      
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'User not found'
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Debug login error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}