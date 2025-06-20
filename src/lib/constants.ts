// Application constants

// Base URL for the application
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://probable-yodel-q7x675676vqpc6v5-3002.app.github.dev';

// API endpoints
export const API_ENDPOINTS = {
  CHILDREN: '/api/admin-sdk/children',
  USERS: '/api/admin-sdk/users',
  ALERTS: '/api/admin-sdk/alerts',
};

// Default pagination values
export const DEFAULT_PAGE_SIZE = 10;

// Image paths
export const DEFAULT_AVATAR = '/images/default-avatar.png';

// Role types
export const ROLES = {
  ADMIN: 'admin',
  PARENT: 'parent',
  SCHOOL: 'school',
  AUTHORITY: 'authority',
  COMMUNITY: 'community',
};