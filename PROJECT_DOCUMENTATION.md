# UNCIP App - Project Documentation

## Overview
UNCIP (Unami National Child Identification Program) is a secure platform that enables rapid child identification and enhances community safety in South African townships. The application connects parents, schools, and authorities to create a safer environment for children.

## Architecture

### Authentication
- NextAuth.js for session management
- Firebase Authentication for user credentials
- Role-based access control (parent, school, authority, admin)
- Support for multiple roles per user

### Database
- Firebase Firestore for data storage
- Real-time updates using Firestore listeners
- Structured collections for users, children, alerts, etc.

### Storage
- Firebase Storage for file uploads (photos, documents)
- Secure access control using Firebase Storage rules

### Frontend
- Next.js 13 with App Router
- React for UI components
- Tailwind CSS for styling
- Client-side hooks for data management

## Core Features

### User Management
- User registration and authentication
- Role-based dashboards
- Profile management
- Organization management for schools and authorities

### Child Profile Management
- Create and manage child profiles
- Upload and store identification photos
- Record essential information (medical, school, etc.)
- Manage guardians and relationships

### Alert System
- Report missing or endangered children
- Real-time notifications to relevant authorities
- Alert resolution workflow
- Historical alert tracking

### School Integration
- Student management for schools
- Attendance tracking
- Incident reporting
- Parent communication

### Authority Dashboard
- Alert management
- Search functionality
- Reporting and analytics
- Resource allocation

## Data Models

### User
```typescript
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  roles?: UserRole[];
  phoneNumber?: string;
  address?: string;
  organization?: Organization;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Child Profile
```typescript
interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  guardians: string[];
  photoURL?: string;
  identificationNumber?: string;
  schoolName?: string;
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}
```

### Alert
```typescript
interface ChildAlert {
  id: string;
  childId: string;
  status: AlertStatus;
  alertType: AlertType;
  description: string;
  lastSeenLocation?: string;
  lastSeenTime?: string;
  lastSeenWearing?: string;
  attachments?: string[];
  contactInfo?: {
    name: string;
    phone: string;
    email?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}
```

## Key Hooks

### useAuth
Manages authentication state and user sessions.

```typescript
const { 
  user,
  userProfile,
  loading,
  signIn,
  signUp,
  logout,
  resetPassword,
  switchRole
} = useAuth();
```

### useFirestore
Provides a wrapper around Firebase Firestore operations.

```typescript
const {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  queryDocuments,
  subscribeToCollection,
  subscribeToDocument
} = useFirestore();
```

### useChildProfiles
Manages child profile data and operations.

```typescript
const {
  children,
  loading,
  error,
  fetchChildren,
  createChild,
  updateChild,
  deleteChild,
  getChild
} = useChildProfiles();
```

### useAlerts
Manages alert data and operations.

```typescript
const {
  alerts,
  loading,
  error,
  fetchAlerts,
  createAlert,
  updateAlert,
  getAlert,
  resolveAlert
} = useAlerts();
```

### useUsers
Manages user data and operations (admin only).

```typescript
const {
  users,
  loading,
  error,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser
} = useUsers();
```

## Deployment

### Environment Variables
Required environment variables for deployment:

```
# Firebase Admin SDK Configuration
FIREBASE_SERVICE_ACCOUNT_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL=your-client-email
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY=your-private-key
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_SERVICE_ACCOUNT_CLIENT_ID=your-client-id
FIREBASE_SERVICE_ACCOUNT_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_SERVICE_ACCOUNT_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL=your-client-cert-url

# Public Firebase config for client-side
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# NextAuth Configuration
NEXTAUTH_URL=your-site-url
NEXTAUTH_SECRET=your-secret-key
```

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Set up Storage
5. Generate a service account key
6. Deploy Firebase security rules

### Deployment Steps
1. Set environment variables
2. Build the application: `npm run build`
3. Deploy to hosting platform (Vercel, Netlify, etc.)
4. Run the setup script to create admin user: `npm run setup:users`
5. Deploy Firebase rules: `npm run deploy:rules`

## Testing

### Test Accounts
- Admin: info@unamifoundation.org / Proof321#
- This account can access all dashboards by switching roles

### Testing Workflow
1. Log in as admin
2. Create test users for different roles
3. Create child profiles
4. Create and resolve alerts
5. Test role-based access control

## Future Enhancements
1. Mobile application
2. Offline support
3. Advanced analytics
4. Integration with external systems
5. Multi-language support