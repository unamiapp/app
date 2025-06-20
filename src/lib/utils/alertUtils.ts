'use client';

import { ChildAlert } from '@/types/child';

/**
 * Normalizes alert data to handle both old and new data structures
 * This helps maintain backward compatibility while we transition to the new structure
 */
export function normalizeAlertData(alert: any): ChildAlert {
  if (!alert) return alert;
  
  // Create a copy to avoid mutating the original
  const normalizedAlert = { ...alert };
  
  // Handle alert type field
  normalizedAlert.alertType = normalizedAlert.alertType || normalizedAlert.type;
  normalizedAlert.type = normalizedAlert.type || normalizedAlert.alertType;
  
  // Ensure status is set to 'active' if missing
  normalizedAlert.status = normalizedAlert.status || 'active';
  
  // Handle lastSeen structure
  if (!normalizedAlert.lastSeen) {
    normalizedAlert.lastSeen = {
      location: normalizedAlert.lastSeenLocation || '',
      description: normalizedAlert.lastSeenWearing || normalizedAlert.clothingDescription || '',
      date: normalizedAlert.lastSeenDate || normalizedAlert.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      time: normalizedAlert.lastSeenTime || '00:00'
    };
  }
  
  // Ensure we have both structures for backward compatibility
  normalizedAlert.lastSeenLocation = normalizedAlert.lastSeenLocation || normalizedAlert.lastSeen?.location;
  normalizedAlert.lastSeenWearing = normalizedAlert.lastSeenWearing || 
                                   normalizedAlert.clothingDescription || 
                                   normalizedAlert.lastSeen?.description;
  normalizedAlert.lastSeenDate = normalizedAlert.lastSeenDate || normalizedAlert.lastSeen?.date;
  normalizedAlert.contactInfo = normalizedAlert.contactInfo || normalizedAlert.contactPhone;
  normalizedAlert.contactPhone = normalizedAlert.contactPhone || normalizedAlert.contactInfo;
  
  return normalizedAlert as ChildAlert;
}

/**
 * Normalizes an array of alert data
 */
export function normalizeAlerts(alerts: any[]): ChildAlert[] {
  if (!alerts || !Array.isArray(alerts)) return [];
  return alerts.map(normalizeAlertData);
}