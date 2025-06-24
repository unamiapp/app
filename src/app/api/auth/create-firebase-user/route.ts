import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 403 });
    }

    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and userId required' 
      }, { status: 400 });
    }

    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const userData = userDoc.data();

    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json({ 
        success: false, 
        error: 'Firebase user exists' 
      }, { status: 409 });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        const userRecord = await adminAuth.createUser({
          uid: userId,
          email: email,
          password: 'demo123',
          displayName: userData?.displayName || userData?.firstName + ' ' + userData?.lastName,
          emailVerified: true,
        });

        await adminAuth.setCustomUserClaims(userRecord.uid, {
          role: userData?.role || 'parent',
          roles: userData?.roles || [userData?.role || 'parent']
        });

        return NextResponse.json({ 
          success: true, 
          uid: userRecord.uid
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create user'
    }, { status: 500 });
  }
}