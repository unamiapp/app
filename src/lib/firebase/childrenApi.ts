/**
 * Direct Firebase Admin SDK methods for children data
 * This file provides direct methods to access children data without going through API routes
 */

import { adminDb } from './admin';
import { ChildProfile } from '@/types/child';
import { CollectionReference, Query, DocumentData } from 'firebase-admin/firestore';

/**
 * Get all children
 */
export async function getChildren(): Promise<ChildProfile[]> {
  try {
    const snapshot = await adminDb.collection('children').get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChildProfile));
  } catch (error) {
    console.error('Error fetching all children:', error);
    throw error;
  }
}

/**
 * Get children by parent ID - supports both parentId and guardians array
 */
export async function getChildrenByParentId(parentId: string): Promise<ChildProfile[]> {
  try {
    // Try new parentId field first
    let snapshot = await adminDb.collection('children')
      .where('parentId', '==', parentId)
      .get();
    
    let children = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChildProfile));
    
    // Also check legacy guardians array for backward compatibility
    const legacySnapshot = await adminDb.collection('children')
      .where('guardians', 'array-contains', parentId)
      .get();
    
    const legacyChildren = legacySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChildProfile));
    
    // Combine results and remove duplicates
    const allChildren = [...children, ...legacyChildren];
    const uniqueChildren = allChildren.filter((child, index, self) => 
      index === self.findIndex(c => c.id === child.id)
    );
    
    return uniqueChildren;
  } catch (error) {
    console.error('Error fetching children by parent ID:', error);
    throw error;
  }
}

/**
 * Get children by school ID
 */
export async function getChildrenBySchool(schoolId: string): Promise<ChildProfile[]> {
  try {
    const snapshot = await adminDb.collection('children')
      .where('schoolId', '==', schoolId)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChildProfile));
  } catch (error) {
    console.error('Error fetching children by school ID:', error);
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
    
    // Ensure we have either parentId or guardians for backward compatibility
    if (!data.parentId && data.guardians && data.guardians.length > 0) {
      // If no parentId but guardians exist, use first guardian as parentId
      data.parentId = data.guardians[0];
    }
    
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