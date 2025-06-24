import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const results: {
      children: { count: number; sample: any[]; error?: string };
      users: { count: number; sample: any[]; error?: string };
      alerts: { count: number; sample: any[]; error?: string };
    } = {
      children: { count: 0, sample: [] },
      users: { count: 0, sample: [] },
      alerts: { count: 0, sample: [] }
    };

    // Check children collection
    try {
      const childrenSnapshot = await adminDb.collection('children').limit(3).get();
      results.children.count = childrenSnapshot.size;
      results.children.sample = childrenSnapshot.docs.map(doc => ({
        id: doc.id,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        parentId: doc.data().parentId,
        guardians: doc.data().guardians
      }));
    } catch (error) {
      results.children = { count: -1, sample: [], error: (error as Error).message };
    }

    // Check users collection
    try {
      const usersSnapshot = await adminDb.collection('users').limit(3).get();
      results.users.count = usersSnapshot.size;
      results.users.sample = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email,
        role: doc.data().role
      }));
    } catch (error) {
      results.users = { count: -1, sample: [], error: (error as Error).message };
    }

    // Check alerts collection
    try {
      const alertsSnapshot = await adminDb.collection('alerts').limit(3).get();
      results.alerts.count = alertsSnapshot.size;
      results.alerts.sample = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        childName: doc.data().childName,
        status: doc.data().status,
        createdAt: doc.data().createdAt
      }));
    } catch (error) {
      results.alerts = { count: -1, sample: [], error: (error as Error).message };
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
}