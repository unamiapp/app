import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 400 });
    }

    const role = (session.user as any).role || 'parent';

    let childrenRef = adminDb.collection('children');
    let queryRef;

    if (role === 'parent') {
      queryRef = childrenRef.where('guardians', 'array-contains', userId);
    } else if (role === 'school') {
      queryRef = childrenRef.where('schoolId', '==', userId);
    } else if (role === 'admin' || role === 'authority') {
      queryRef = childrenRef;
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const snapshot = await queryRef.get();
    
    const children = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 400 });
    }

    const role = (session.user as any).role || 'parent';
    
    if (role !== 'parent' && role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await request.json();
    
    if (!data.guardians || !data.guardians.includes(userId)) {
      data.guardians = [...(data.guardians || []), userId];
    }

    const timestamp = new Date().toISOString();
    const childData = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: userId,
    };

    const docRef = await adminDb.collection('children').add(childData);
    
    await adminDb.collection('audit_logs').add({
      userId,
      userRole: role,
      operation: 'create_child',
      resourceId: docRef.id,
      resourceType: 'children',
      timestamp,
      details: `Created child profile for ${data.firstName} ${data.lastName}`
    });

    return NextResponse.json({
      id: docRef.id,
      ...childData
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating child profile:', error);
    return NextResponse.json({ error: 'Failed to create child profile' }, { status: 500 });
  }
}