# UNCIP App

## Overview
UNCIP (Unami National Child Identification Program) is a secure platform that enables rapid child identification and enhances community safety in South African townships. The application connects parents, schools, and authorities to create a safer environment for children.

## Documentation
- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Comprehensive documentation of the project
- [Implementation Summary](./IMPLEMENTATION_SUMMARY_UPDATED.md) - Summary of recent changes and next steps

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase project

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration

4. Run the development server:
   ```bash
   npm run dev
   ```

### Setup Admin User
```bash
npm run setup:users
```

### Deploy Firebase Rules
```bash
npm run deploy:rules
```

## Authentication
The application uses NextAuth.js with Firebase Authentication. The admin user can access all dashboards by switching roles.

### Admin Credentials
- Email: info@unamifoundation.org
- Password: Proof321#

## Features
- Role-based dashboards (parent, school, authority, admin)
- Child profile management
- Alert system for missing children
- User management
- Real-time updates

## Tech Stack
- Next.js 13 (App Router)
- React
- Firebase (Auth, Firestore, Storage)
- NextAuth.js
- Tailwind CSS

## Project Structure
```
/src
  /app                 # Next.js App Router
    /api               # API routes
    /auth              # Authentication pages
    /dashboard         # Dashboard pages
  /components          # Reusable components
  /hooks               # Custom React hooks
  /lib                 # Utility functions and libraries
    /firebase          # Firebase configuration
  /types               # TypeScript type definitions
/scripts               # Utility scripts
/public                # Static assets
```

## License
This project is proprietary and confidential.