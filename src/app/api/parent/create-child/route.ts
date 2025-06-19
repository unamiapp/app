import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const data = await request.json();
    
    const timestamp = new Date().toISOString();
    const childData = {
      ...data,
      guardians: [userId],
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: userId,
    };

    const docRef = await adminDb.collection('children').add(childData);
    
    return NextResponse.json({
      id: docRef.id,
      ...childData
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
  }
}