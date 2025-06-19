'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  alertId?: string;
  childId?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { userProfile } = useAuth();
  const { subscribeToCollection, whereEqual, updateDocument } = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!userProfile?.id) return;

    // Subscribe to user notifications
    const unsubscribe = subscribeToCollection<Notification>(
      'user_notifications',
      [whereEqual('userId', userProfile.id)],
      (data) => {
        setNotifications(data);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.id, subscribeToCollection, whereEqual]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (notification.status === 'unread') {
      await updateDocument('user_notifications', notification.id, {
        status: 'read'
      });
    }

    // Navigate to relevant page if applicable
    if (notification.alertId) {
      router.push(`/dashboard/${userProfile?.role}/alerts/${notification.alertId}`);
    } else if (notification.childId) {
      router.push(`/dashboard/${userProfile?.role}/children/${notification.childId}`);
    }

    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span className="sr-only">View notifications</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1 max-h-96 overflow-y-auto" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b">
              Notifications
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((notification) => (
                  <button
                    key={notification.id}
                    className={`w-full text-left block px-4 py-2 text-sm ${
                      notification.status === 'unread' ? 'bg-blue-50' : ''
                    } ${
                      notification.priority === 'high' ? 'border-l-4 border-red-500' : ''
                    } hover:bg-gray-100`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}