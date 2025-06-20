// This file can be used in both client and server components

/**
 * Extract user ID from session - handles different auth providers
 * @param user The user object from the session
 * @returns The user ID
 */
export function extractUserId(user: any): string {
  return user?.id || user?.uid || user?.sub || 'unknown';
}

/**
 * Extract user role from session
 * @param user The user object from the session
 * @param defaultRole Default role if none is found
 * @returns The user role
 */
export function extractUserRole(user: any, defaultRole: string = 'parent'): string {
  return user?.role || defaultRole;
}