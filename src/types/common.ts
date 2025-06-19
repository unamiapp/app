export interface ActivityItem {
  id: string;
  type: 'alert' | 'profile' | 'login' | 'system';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}