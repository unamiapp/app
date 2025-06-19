export interface Notification {
  id: string;
  type: 'alert' | 'system' | 'message';
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
  recipients: string[];
  metadata?: Record<string, any>;
}

export interface UserNotification {
  id: string;
  userId: string;
  notificationType: 'alert' | 'system' | 'message';
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  alertId?: string;
  childId?: string;
}