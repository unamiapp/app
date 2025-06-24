import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated as admin
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }
    
    // Check if user exists in Firestore
    const usersSnapshot = await adminDb.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in Firestore' 
      });
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if password exists
    const hasPassword = !!userData.password;
    const passwordInfo = hasPassword ? {
      exists: true,
      length: userData.password.length,
      firstChar: userData.password.charAt(0),
      lastChar: userData.password.charAt(userData.password.length - 1)
    } : { exists: false };
    
    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        password: passwordInfo,
        canLoginWithDemo: true,
        canLoginWithPassword: hasPassword
      }
    });
  } catch (error) {
    console.error('Error checking credentials:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check credentials',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}