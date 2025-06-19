# UNCIP-APP (UNAMI NATIONAL CHILD IDENTIFICATION PROGRAM)
*Progressive Web App optimized for Vercel Free Tier*

## Project Status & Development Notes

### Current Status
- Role-Based Access Control (RBAC) fully implemented with 5 user roles (parent, school, authority, community, admin)
- Unified dashboard architecture with role-specific views
- Firebase Authentication and Firestore integration
- NextAuth.js for authentication flow with Firebase
- Child profile management functionality
- Alert system for missing children
- Responsive UI with Tailwind CSS

### Recent Improvements
- Created unified dashboard architecture with modular components
- Implemented DashboardStats, QuickActions, and RecentActivity components
- Added child profile creation and management
- Integrated Firebase Storage for photo uploads
- Created API routes for children and alerts
- Fixed Firebase integration issues

### Known Issues
- Firebase data fetching needs proper error handling
- Some components show placeholder data instead of real data
- Missing SMS integration for alerts
- Community features not yet implemented
- Testing suite needs to be set up

### Important Development Notes
- **Admin Login:** Use info@unamifoundation.org with any password (minimum 6 characters) to test admin role functionality
- **Firebase Integration:** Environment variables in .env.local must be properly configured
- **Dashboard Architecture:** Each role has its own dashboard that uses shared components
- **Component Structure:** Follow the modular component approach for new features
- **API Routes:** Server-side logic is implemented in API routes using Firebase Admin SDK

### Firebase Configuration
- Firebase project: ncip-app
- Authentication methods: Email/Password (Google OAuth disabled for now)
- Firestore database configured for data storage
- Firebase Admin SDK configured with service account credentials
- Environment variables stored in .env.local file

## Next Development Steps

### 1. Data Integration for Dashboard Components
- Connect dashboard components to real Firestore data
- Implement real-time updates using Firebase listeners
- Add proper loading states and error handling
- Create data visualization components for statistics

### 2. Alert System Enhancement
- Complete the alert creation workflow
- Implement alert resolution and cancellation functionality
- Add notification system for new alerts
- Create alert filtering and search capabilities
- Implement geolocation features for alerts

### 3. Child Profile Management
- Complete the child profile editing functionality
- Enhance photo upload with image cropping
- Implement validation for all profile fields
- Create profile sharing permissions between parents and schools
- Add document upload for identification documents

### 4. Community Features
- Design and implement community resources section
- Create community messaging system
- Implement incident reporting for community members
- Add community safety metrics dashboard
- Build educational content management system

### 5. Testing & Security
- Set up Jest for unit testing
- Implement Cypress for end-to-end testing
- Create test fixtures and mocks for Firebase services
- Add proper Firebase security rules
- Implement comprehensive audit logging

## 🎯 App Vision & Mission
**Mission:** To create a secure, user-friendly mobile platform that enables rapid child identification and enhances community safety in South African townships.

**Vision:** A connected network of parents, schools, and authorities working together to protect every child through technology.

## 🎭 Target Users
- 👪 **Parents & Guardians:** Register children, update information, receive alerts, access emergency resources
- 🏫 **Schools & Teachers:** Verify student identities, report incidents, communicate with parents
- 👮 **Authorities & NGOs:** Access verified child data during emergencies, coordinate search efforts
- 🏘️ **Community Leaders:** Monitor local child safety, coordinate community responses, access resources

## 🌟 Key Benefits
- ✅ **Instant Identification:** Quick access to child information during emergencies
- 📱 **Mobile-First Design:** Works on basic smartphones, offline capability
- 🔐 **Secure & Private:** Bank-level security, POPIA compliance
- 🌍 **Community Network:** Connects families, schools, and authorities

## 🛠️ Tech Stack
- **Frontend:** Next.js 14 with TypeScript
- **Backend:** Next.js API Routes + Firebase Admin SDK
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication + NextAuth.js
- **Storage:** Firebase Storage for images and documents
- **Hosting:** Vercel (optimized for free tier)
- **State Management:** React Context API + Custom Hooks
- **Styling:** Tailwind CSS with custom theming

## 🔧 Development Guidelines
- Separate server components from client components
- Use shared dashboard components with role-specific parameters
- Follow proper TypeScript typing
- Implement proper error handling
- Ensure responsive design for all screen sizes
- Maintain clean code structure and documentation

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Firebase project set up
- Vercel account (for deployment)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with Firebase configuration
4. Run the development server: `npm run dev`

### Environment Variables
Create a `.env.local` file with the following variables:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
```

For detailed implementation status and project structure, see [readme1.md](./docs-archive/readme1.md) and [DASHBOARD_ARCHITECTURE.md](./docs-archive/DASHBOARD_ARCHITECTURE.md).