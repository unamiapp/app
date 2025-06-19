'use client';

import { useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from './useAuth';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { userProfile } = useAuth();

  // Add a document to Firestore
  const addDocument = async <T>(collectionName: string, data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a document reference with an auto-generated ID
      const docRef = doc(collection(db, collectionName));
      
      // Add timestamp fields
      const timestamp = new Date().toISOString();
      const dataWithTimestamps = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: userProfile?.id || 'unknown',
      };
      
      // Set the document data
      await setDoc(docRef, dataWithTimestamps);
      
      return {
        id: docRef.id,
        ...dataWithTimestamps,
      } as T;
    } catch (err) {
      setError(err as Error);
      console.error(`Error adding document to ${collectionName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a document in Firestore
  const updateDocument = async <T>(collectionName: string, id: string, data: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      
      // Add updated timestamp
      const dataWithTimestamp = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(docRef, dataWithTimestamp);
      
      return {
        id,
        ...dataWithTimestamp,
      } as Partial<T>;
    } catch (err) {
      setError(err as Error);
      console.error(`Error updating document in ${collectionName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a document from Firestore
  const deleteDocument = async (collectionName: string, id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      setError(err as Error);
      console.error(`Error deleting document from ${collectionName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a document from Firestore
  const getDocument = async <T>(collectionName: string, id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as T;
      } else {
        throw new Error(`Document not found in ${collectionName}`);
      }
    } catch (err) {
      setError(err as Error);
      console.error(`Error getting document from ${collectionName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Query documents from Firestore
  const queryDocuments = async <T>(
    collectionName: string,
    queryConstraints: any[] = []
  ) => {
    try {
      let q = collection(db, collectionName);
      
      // Apply query constraints if provided
      if (queryConstraints.length > 0) {
        q = query(q, ...queryConstraints);
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (err) {
      console.error(`Error querying documents from ${collectionName}:`, err);
      return [] as T[];
    }
  };
  
  // Subscribe to real-time updates for a collection
  const subscribeToCollection = <T>(
    collectionName: string,
    queryConstraints: any[] = [],
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe => {
    try {
      // Provide immediate empty data to prevent flickering
      setTimeout(() => {
        callback([] as T[]);
      }, 0);
      
      let q = collection(db, collectionName);
      
      // Apply query constraints if provided
      if (queryConstraints.length > 0) {
        q = query(q, ...queryConstraints);
      }
      
      // Set up real-time listener
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        
        callback(data);
      }, (err) => {
        console.error(`Error in real-time subscription to ${collectionName}:`, err);
        setError(err as Error);
        if (errorCallback) {
          errorCallback(err as Error);
        }
      });
    } catch (err) {
      console.error(`Error setting up subscription to ${collectionName}:`, err);
      setError(err as Error);
      if (errorCallback) {
        errorCallback(err as Error);
      }
      // Return a no-op unsubscribe function
      return () => {};
    }
  };
  
  // Subscribe to real-time updates for a document
  const subscribeToDocument = <T>(
    collectionName: string,
    documentId: string,
    callback: (data: T | null) => void
  ): Unsubscribe => {
    try {
      const docRef = doc(db, collectionName, documentId);
      
      // Set up real-time listener
      return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = {
            id: snapshot.id,
            ...snapshot.data(),
          } as T;
          
          callback(data);
        } else {
          callback(null);
        }
      }, (err) => {
        console.error(`Error in real-time subscription to document ${documentId}:`, err);
        setError(err as Error);
      });
    } catch (err) {
      console.error(`Error setting up subscription to document ${documentId}:`, err);
      setError(err as Error);
      // Return a no-op unsubscribe function
      return () => {};
    }
  };

  // Helper functions to create query constraints
  const whereEqual = (field: string, value: any) => where(field, '==', value);
  const whereNotEqual = (field: string, value: any) => where(field, '!=', value);
  const whereGreaterThan = (field: string, value: any) => where(field, '>', value);
  const whereGreaterThanOrEqual = (field: string, value: any) => where(field, '>=', value);
  const whereLessThan = (field: string, value: any) => where(field, '<', value);
  const whereLessThanOrEqual = (field: string, value: any) => where(field, '<=', value);
  const whereArrayContains = (field: string, value: any) => where(field, 'array-contains', value);
  const whereArrayContainsAny = (field: string, value: any[]) => where(field, 'array-contains-any', value);
  const whereIn = (field: string, value: any[]) => where(field, 'in', value);
  const whereNotIn = (field: string, value: any[]) => where(field, 'not-in', value);
  const orderByAsc = (field: string) => orderBy(field, 'asc');
  const orderByDesc = (field: string) => orderBy(field, 'desc');
  const limitTo = (limit: number) => limit;

  return {
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    queryDocuments,
    subscribeToCollection,
    subscribeToDocument,
    // Export query constraint helpers
    where,
    whereEqual,
    whereNotEqual,
    whereGreaterThan,
    whereGreaterThanOrEqual,
    whereLessThan,
    whereLessThanOrEqual,
    whereArrayContains,
    whereArrayContainsAny,
    whereIn,
    whereNotIn,
    orderBy,
    orderByAsc,
    orderByDesc,
    limitTo,
  };
};