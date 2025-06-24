# Debug API Status

This document provides an overview of the debug API endpoints available in the application and the Firestore collections they can access.

## Available Debug API Endpoints

| Endpoint | Collection | Status | Notes |
|----------|------------|--------|-------|
| `/api/debug/activities` | `activities` | ✅ Working | Returns activities data with fallback to mock data |
| `/api/debug/alerts` | `alerts` | ✅ Working | Returns all alerts in the system |
| `/api/debug/alerts/[id]` | `alerts` | ✅ Working | Returns a specific alert by ID |
| `/api/debug/children` | `children` | ✅ Working | Returns children data with pagination |
| `/api/debug/users` | `users` | ✅ Working | Returns users with optional filtering by ID or email |
| `/api/debug/upload` | Storage | ✅ Working | Handles file uploads to Firebase Storage |
| `/api/debug/image/[filename]` | N/A | ✅ Working | Fallback for image serving when Storage is unavailable |
| `/api/debug/check-credentials` | `users` | ✅ Working | Checks user credentials (admin only) |
| `/api/debug/user-check` | `users` | ✅ Working | Checks user data (admin only) |
| `/api/debug/session` | N/A | ✅ Working | Returns current session information |
| `/api/debug/login` | N/A | ✅ Working | Alternative login endpoint |
| `/api/debug/env` | N/A | ✅ Working | Returns environment information (admin only) |

## Accessible Firestore Collections

The following Firestore collections are used by the application:

1. `users` - User profiles and authentication data
2. `children` - Child profiles linked to parents
3. `alerts` - Alert notifications for missing children, etc.
4. `activities` - User activity logs
5. `settings` - Application settings
6. `audit_logs` - Security audit logs (admin only)

## Fallback Mechanisms

The application implements fallback mechanisms to ensure functionality even when primary APIs fail:

1. **Children Data**: 
   - Primary: `/api/admin-sdk/children`
   - Fallback: `/api/debug/children`

2. **User Data**:
   - Primary: `/api/admin-sdk/users`
   - Fallback: `/api/debug/users`

3. **File Storage**:
   - Primary: Firebase Storage
   - Fallback: `/api/debug/image/[filename]`

## Testing Debug APIs

You can test all debug APIs using the provided script:

```bash
node scripts/test-debug-apis.js
```

This script will:
1. Test each debug API endpoint
2. Check which Firestore collections are accessible
3. Generate a report with the results

## Troubleshooting

If you encounter issues with the debug APIs:

1. Check Firebase connection in the admin-singleton.ts file
2. Verify environment variables are properly set
3. Check Firebase rules to ensure proper access
4. Look for error logs in the server console

## Security Note

Debug APIs should be properly secured in production. Most endpoints require authentication and have role-based access control.