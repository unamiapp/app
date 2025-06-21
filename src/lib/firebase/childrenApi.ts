/**
 * Direct Firebase Admin SDK methods for children data
 * This file provides direct methods to access children data without going through API routes
 */

import { adminDb } from './admin';
import { ChildProfile } from '@/types/child';
import { CollectionReference, Query, DocumentData } from 'firebase-admin/firestore';

/**
 * Get all children with optional filtering by parent ID
 */
export async function getChildren(parentId?: string): Promise<ChildProfile[]> {
  try {
    // Build query based on filters
    let query: CollectionReference<DocumentData> | Query<DocumentData> = adminDb.collection('children');
    
    // Apply parent filter if provided
    if (parentId) {
      query = query.where('guardians', 'array-contains', parentId);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChildProfile));
  } catch (error) {
    console.error('Error fetching children:', error);
    throw error;
  }
}

/**
 * Get a child by ID
 */
export async function getChildById(id: string): Promise<ChildProfile | null> {
  try {
    const childDoc = await adminDb.collection('children').doc(id).get();
    
    if (!childDoc.exists) {
      return null;
    }
    
    return {
      id: childDoc.id,
      ...childDoc.data()
    } as ChildProfile;
  } catch (error) {
    console.error('Error fetching child by ID:', error);
    throw error;
  }
}

/**
 * Create a new child
 */
export async function createChild(childData: Omit<ChildProfile, 'id'>): Promise<ChildProfile> {
  try {
    // Add timestamps
    const now = new Date().toISOString();
    const data = {
      ...childData,
      createdAt: now,
      updatedAt: now
    };
    
    // Create child in Firestore
    const childRef = adminDb.collection('children').doc();
    await childRef.set(data);
    
    return {
      id: childRef.id,
      ...data
    } as ChildProfile;
  } catch (error) {
    console.error('Error creating child:', error);
    throw error;
  }
}

/**
 * Update a child
 */
export async function updateChild(id: string, childData: Partial<ChildProfile>): Promise<ChildProfile> {
  try {
    // Add updated timestamp
    const data = {
      ...childData,
      updatedAt: new Date().toISOString()
    };
    
    // Update child in Firestore
    await adminDb.collection('children').doc(id).update(data);
    
    // Get the updated child
    const updatedChild = await getChildById(id);
    
    if (!updatedChild) {
      throw new Error('Child not found after update');
    }
    
    return updatedChild;
  } catch (error) {
    console.error('Error updating child:', error);
    throw error;
  }
}

/**
 * Delete a child
 */
export async function deleteChild(id: string): Promise<boolean> {
  try {
    // Delete child from Firestore
    await adminDb.collection('children').doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting child:', error);
    throw error;
  }
}