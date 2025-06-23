# Enhanced Architecture Plan - Guardian Management & Geofencing

## Overview

This document outlines the enhanced architecture for implementing guardian management and geofencing features across the entire UNCIP application, building upon our existing hybrid access control model.

## Current Architecture Assessment

### ✅ **Strengths**
- Hybrid access control (RBAC + ReBAC) successfully implemented
- Firebase rules deployed and working
- Parent-child relationships functioning
- Pagination and full CRUD operations for children
- Clean component architecture with NextAuth integration

### 🔄 **Areas for Enhancement**
- Guardian management system needs expansion
- Geofencing capabilities missing
- Location-based features not implemented
- Real-time notifications system needed
- Enhanced parent profile management required

## Enhanced Data Models

### 1. Extended User Profile
```typescript
interface EnhancedUserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'parent' | 'admin' | 'school' | 'authority' | 'community';
  
  // Enhanced parent profile
  parentProfile?: {
    primaryPhone: string;
    secondaryPhone?: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    guardianshipRequests?: GuardianshipRequest[];
    trustedGuardians?: TrustedGuardian[];
  };
  
  // Geofencing preferences
  geofenceSettings?: {
    enabled: boolean;
    defaultRadius: number; // in meters
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  
  createdAt: string;
  updatedAt: string;
}
```

### 2. Enhanced Child Profile
```typescript
interface EnhancedChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  
  // Guardian relationships
  primaryParentId: string;
  guardians: Guardian[];
  
  // School and location info
  schoolName?: string;
  schoolId?: string;
  schoolAddress?: Address;
  
  // Geofencing data
  safeZones: SafeZone[];
  lastKnownLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
    accuracy: number;
  };
  
  // Enhanced profile data
  photoURL?: string;
  identificationNumber?: string;
  address?: Address;
  medicalInfo?: MedicalInfo;
  
  // Tracking and safety
  trackingEnabled: boolean;
  emergencyContacts: EmergencyContact[];
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### 3. Guardian Management System
```typescript
interface Guardian {
  id: string;
  userId: string; // Reference to user account
  relationship: 'parent' | 'grandparent' | 'aunt' | 'uncle' | 'sibling' | 'caregiver' | 'other';
  permissions: GuardianPermission[];
  status: 'active' | 'pending' | 'suspended';
  addedBy: string;
  addedAt: string;
  approvedAt?: string;
}

interface GuardianPermission {
  type: 'view_profile' | 'edit_profile' | 'location_tracking' | 'emergency_contact' | 'school_communication';
  granted: boolean;
}

interface GuardianshipRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  childId: string;
  relationship: string;
  message?: string;
  permissions: GuardianPermission[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  respondedAt?: string;
}

interface TrustedGuardian {
  userId: string;
  displayName: string;
  relationship: string;
  phone: string;
  email: string;
  permissions: GuardianPermission[];
  addedAt: string;
}
```

### 4. Geofencing System
```typescript
interface SafeZone {
  id: string;
  name: string;
  type: 'home' | 'school' | 'daycare' | 'relative' | 'activity' | 'custom';
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  address?: string;
  
  // Time-based restrictions
  activeHours?: {
    start: string; // HH:MM format
    end: string;
    days: number[]; // 0-6, Sunday to Saturday
  };
  
  // Notifications
  notifications: {
    onEnter: boolean;
    onExit: boolean;
    onOverstay?: {
      enabled: boolean;
      duration: number; // in minutes
    };
  };
  
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

interface GeofenceEvent {
  id: string;
  childId: string;
  safeZoneId: string;
  eventType: 'enter' | 'exit' | 'overstay';
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  notificationsSent: string[]; // Array of user IDs who were notified
}

interface LocationUpdate {
  id: string;
  childId: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  };
  timestamp: string;
  source: 'gps' | 'network' | 'passive';
  batteryLevel?: number;
}
```

## Enhanced API Architecture

### 1. Guardian Management APIs
```typescript
// /api/guardians/requests
POST   - Send guardianship request
GET    - List guardianship requests (sent/received)
PUT    - Respond to guardianship request
DELETE - Cancel/revoke guardianship request

// /api/guardians/manage
GET    - List child's guardians
POST   - Add guardian directly (by primary parent)
PUT    - Update guardian permissions
DELETE - Remove guardian

// /api/guardians/invitations
POST   - Invite user to become guardian
GET    - List pending invitations
PUT    - Accept/decline invitation
```

### 2. Geofencing APIs
```typescript
// /api/geofencing/safezones
GET    - List child's safe zones
POST   - Create safe zone
PUT    - Update safe zone
DELETE - Remove safe zone

// /api/geofencing/events
GET    - List geofence events for child
POST   - Record geofence event (system use)

// /api/geofencing/location
GET    - Get child's current/last known location
POST   - Update child's location
PUT    - Update location tracking settings

// /api/geofencing/notifications
GET    - List geofence notifications
POST   - Send geofence notification
PUT    - Mark notification as read
```

### 3. Enhanced Profile APIs
```typescript
// /api/profile/parent
GET    - Get enhanced parent profile
PUT    - Update parent profile with guardian settings

// /api/profile/emergency-contacts
GET    - List emergency contacts
POST   - Add emergency contact
PUT    - Update emergency contact
DELETE - Remove emergency contact
```

## Component Architecture Enhancements

### 1. Enhanced Parent Profile Components
```
/components/parent/
├── profile/
│   ├── ParentProfileForm.tsx
│   ├── EmergencyContactsManager.tsx
│   ├── AddressManager.tsx
│   └── GeofenceSettings.tsx
├── guardians/
│   ├── GuardiansList.tsx
│   ├── GuardianInviteForm.tsx
│   ├── GuardianshipRequests.tsx
│   ├── PermissionsManager.tsx
│   └── TrustedGuardiansManager.tsx
└── geofencing/
    ├── SafeZonesManager.tsx
    ├── SafeZoneForm.tsx
    ├── LocationTracker.tsx
    ├── GeofenceEvents.tsx
    └── LocationMap.tsx
```

### 2. Enhanced Child Profile Components
```
/components/children/
├── profile/
│   ├── ChildProfileView.tsx (enhanced)
│   ├── ChildProfileForm.tsx (enhanced)
│   └── ChildLocationCard.tsx
├── safety/
│   ├── SafeZonesList.tsx
│   ├── LocationHistory.tsx
│   ├── EmergencyContactsList.tsx
│   └── TrackingSettings.tsx
└── guardians/
    ├── ChildGuardiansList.tsx
    ├── GuardianPermissions.tsx
    └── GuardianInviteChild.tsx
```

### 3. Geofencing Components
```
/components/geofencing/
├── maps/
│   ├── InteractiveMap.tsx
│   ├── SafeZoneOverlay.tsx
│   ├── LocationMarker.tsx
│   └── GeofenceDrawer.tsx
├── notifications/
│   ├── GeofenceAlert.tsx
│   ├── NotificationCenter.tsx
│   └── AlertSettings.tsx
└── tracking/
    ├── LocationStatus.tsx
    ├── TrackingToggle.tsx
    └── BatteryIndicator.tsx
```

## Database Schema Updates

### 1. Firestore Collections
```
/users/{userId}
  - Enhanced with parentProfile, geofenceSettings

/children/{childId}
  - Enhanced with guardians array, safeZones, trackingEnabled

/guardianship_requests/{requestId}
  - New collection for managing guardian requests

/safe_zones/{zoneId}
  - Geofencing zones for children

/geofence_events/{eventId}
  - Location events and notifications

/location_updates/{updateId}
  - Real-time location tracking data

/emergency_contacts/{contactId}
  - Enhanced emergency contact management
```

### 2. Firebase Rules Updates
```javascript
// Enhanced rules for guardian access
function isGuardianOf(childId) {
  return isSignedIn() && 
    get(/databases/$(database)/documents/children/$(childId)).data.guardians
    .hasAny([{'userId': request.auth.uid, 'status': 'active'}]);
}

// Geofencing access rules
match /safe_zones/{zoneId} {
  allow read, write: if isSignedIn() && (
    isAdmin() || 
    resource.data.createdBy == request.auth.uid ||
    isGuardianOf(resource.data.childId)
  );
}

match /location_updates/{updateId} {
  allow read: if isSignedIn() && (
    isAdmin() ||
    isParentOf(resource.data.childId) ||
    isGuardianOf(resource.data.childId)
  );
  allow write: if isSignedIn() && (
    isAdmin() ||
    isParentOf(resource.data.childId)
  );
}
```

## Implementation Phases

### Phase 1: Enhanced Parent Profile (Week 1-2)
1. **Update parent profile form** with enhanced fields
2. **Implement emergency contacts** management
3. **Add address management** with geocoding
4. **Create geofence settings** interface
5. **Update API routes** for enhanced profile data

### Phase 2: Guardian Management System (Week 3-4)
1. **Implement guardian invitation** system
2. **Create guardianship requests** workflow
3. **Build permissions management** interface
4. **Add guardian dashboard** access
5. **Update child access controls** for guardians

### Phase 3: Geofencing Foundation (Week 5-6)
1. **Implement safe zones** CRUD operations
2. **Add interactive map** components
3. **Create location tracking** system
4. **Build geofence event** handling
5. **Implement basic notifications**

### Phase 4: Advanced Geofencing (Week 7-8)
1. **Real-time location** updates
2. **Advanced geofence** algorithms
3. **Push notifications** system
4. **Location history** and analytics
5. **Emergency alert** system

### Phase 5: Integration & Testing (Week 9-10)
1. **Cross-platform testing**
2. **Performance optimization**
3. **Security audit**
4. **User acceptance testing**
5. **Production deployment**

## Technical Considerations

### 1. Location Services
- **GPS Integration**: React Native Geolocation or Web Geolocation API
- **Background Tracking**: Service workers for web, background tasks for mobile
- **Battery Optimization**: Intelligent location update intervals
- **Privacy Controls**: Granular location sharing permissions

### 2. Real-time Features
- **WebSocket Integration**: Real-time location updates
- **Push Notifications**: Firebase Cloud Messaging
- **Offline Support**: Local storage and sync when online
- **Performance**: Efficient data structures and caching

### 3. Security & Privacy
- **Location Encryption**: Encrypt location data at rest
- **Access Controls**: Granular permissions for guardians
- **Data Retention**: Configurable location history retention
- **Compliance**: GDPR/CCPA compliance for location data

### 4. Scalability
- **Database Optimization**: Efficient queries and indexing
- **Caching Strategy**: Redis for frequently accessed data
- **CDN Integration**: Fast map tile delivery
- **Load Balancing**: Handle concurrent location updates

## Success Metrics

### 1. Guardian Management
- Guardian invitation acceptance rate > 80%
- Average time to approve guardianship < 24 hours
- Guardian engagement with child profiles > 60%

### 2. Geofencing
- Location accuracy within 10 meters 95% of time
- Geofence event detection latency < 30 seconds
- False positive rate < 5%

### 3. User Experience
- Profile completion rate > 90%
- Feature adoption rate > 70%
- User satisfaction score > 4.5/5

## Conclusion

This enhanced architecture builds upon our successful hybrid access control implementation to add comprehensive guardian management and geofencing capabilities. The phased approach ensures stable development while maintaining the existing functionality that's already working well.

The guardian system will allow parents to safely share child information with trusted family members, while the geofencing system will provide peace of mind through location-based safety features. Both systems maintain the same security principles we've established with proper role-based and relationship-based access controls.