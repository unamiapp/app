'use client';

import { useState } from 'react';
import { useFirestore } from './useFirestore';
import { toast } from 'react-hot-toast';

export interface CrudOptions {
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  errorMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    get?: string;
  };
  showToasts?: boolean;
}

export function useCrudOperations<T extends { id: string }>(
  collectionName: string,
  options: CrudOptions = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const {
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    queryDocuments,
    subscribeToCollection
  } = useFirestore();

  const defaultOptions: Required<CrudOptions> = {
    successMessages: {
      create: `Item created successfully`,
      update: `Item updated successfully`,
      delete: `Item deleted successfully`,
    },
    errorMessages: {
      create: `Failed to create item`,
      update: `Failed to update item`,
      delete: `Failed to delete item`,
      get: `Failed to load item`,
    },
    showToasts: true,
  };

  const mergedOptions = {
    ...defaultOptions,
    successMessages: { ...defaultOptions.successMessages, ...options.successMessages },
    errorMessages: { ...defaultOptions.errorMessages, ...options.errorMessages },
    showToasts: options.showToasts !== undefined ? options.showToasts : defaultOptions.showToasts,
  };

  const create = async (data: Omit<T, 'id'>): Promise<T> => {
    try {
      setLoading(true);
      const newItem = await addDocument<T>(collectionName, data);
      
      // Update local state
      setItems(prev => [...prev, newItem]);
      
      if (mergedOptions.showToasts) {
        toast.success(mergedOptions.successMessages.create || 'Item created successfully');
      }
      
      return newItem;
    } catch (err) {
      console.error(`Error creating ${collectionName}:`, err);
      setError(err as Error);
      
      if (mergedOptions.showToasts) {
        toast.error(mergedOptions.errorMessages.create || 'Failed to create item');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<T>): Promise<T> => {
    try {
      setLoading(true);
      const updatedItem = await updateDocument<T>(collectionName, id, data);
      
      // Update local state
      setItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updatedItem } as T : item)
      );
      
      if (mergedOptions.showToasts) {
        toast.success(mergedOptions.successMessages.update || 'Item updated successfully');
      }
      
      return updatedItem as T;
    } catch (err) {
      console.error(`Error updating ${collectionName}:`, err);
      setError(err as Error);
      
      if (mergedOptions.showToasts) {
        toast.error(mergedOptions.errorMessages.update || 'Failed to update item');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await deleteDocument(collectionName, id);
      
      // Update local state
      setItems(prev => prev.filter(item => item.id !== id));
      
      if (mergedOptions.showToasts) {
        toast.success(mergedOptions.successMessages.delete || 'Item deleted successfully');
      }
      
      return true;
    } catch (err) {
      console.error(`Error deleting ${collectionName}:`, err);
      setError(err as Error);
      
      if (mergedOptions.showToasts) {
        toast.error(mergedOptions.errorMessages.delete || 'Failed to delete item');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const get = async (id: string): Promise<T> => {
    try {
      setLoading(true);
      return await getDocument<T>(collectionName, id);
    } catch (err) {
      console.error(`Error getting ${collectionName}:`, err);
      setError(err as Error);
      
      if (mergedOptions.showToasts) {
        toast.error(mergedOptions.errorMessages.get || 'Failed to load item');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const subscribe = (
    queryConstraints: any[] = [],
    callback?: (items: T[]) => void
  ) => {
    return subscribeToCollection<T>(
      collectionName,
      queryConstraints,
      (updatedItems) => {
        setItems(updatedItems);
        setLoading(false);
        if (callback) callback(updatedItems);
      }
    );
  };

  return {
    items,
    setItems,
    loading,
    error,
    create,
    update,
    remove,
    get,
    subscribe,
  };
}