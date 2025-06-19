import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  userId: string;
  alertId?: string;
  childId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const useNotifications = (limitCount = 10) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create query for user's notifications, ordered by creation date
      const notificationsRef = collection(db, 'notifications');
      const notificationsQuery = query(
        notificationsRef,
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const notificationsData: Notification[] = [];
          let unread = 0;

          snapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            const notification: Notification = {
              id: doc.id,
              userId: data.userId,
              alertId: data.alertId,
              childId: data.childId,
              type: data.type,
              title: data.title,
              message: data.message,
              read: data.read || false,
              createdAt: data.createdAt,
            };
            
            notificationsData.push(notification);
            
            if (!notification.read) {
              unread++;
            }
          });

          setNotifications(notificationsData);
          setUnreadCount(unread);
          setLoading(false);
        },
        (err) => {
          console.error('Error getting notifications:', err);
          setError(err as Error);
          setLoading(false);
        }
      );

      // Clean up listener on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up notifications listener:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user?.id, limitCount]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err as Error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;

    try {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);

      notifications.forEach((notification) => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });

      await batch.commit();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err as Error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
};