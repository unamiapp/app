import { FirebaseError } from 'firebase/app';
import { NextResponse } from 'next/server';

// Standard error response structure
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Firebase error handler
export const handleFirebaseError = (error: unknown): ErrorResponse => {
  if (error instanceof FirebaseError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getFirebaseErrorMessage(error.code),
        details: error.message,
      },
    };
  }
  
  // Handle non-Firebase errors
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return {
    success: false,
    error: {
      code: 'unknown_error',
      message: errorMessage,
    },
  };
};

// API error response
export const createErrorResponse = (
  status: number,
  code: string,
  message: string,
  details?: any
): NextResponse => {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
};

// User-friendly Firebase error messages
const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    // Auth errors
    'auth/email-already-in-use': 'This email is already in use. Please try another email or sign in.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/weak-password': 'Password is too weak. Please use a stronger password.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
    
    // Firestore errors
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested document was not found.',
    'already-exists': 'The document already exists.',
    
    // Storage errors
    'storage/unauthorized': 'You do not have permission to access this file.',
    'storage/canceled': 'The file upload was canceled.',
    'storage/unknown': 'An unknown error occurred during file upload.',
    'storage/object-not-found': 'The file does not exist.',
    'storage/quota-exceeded': 'Storage quota exceeded. Please contact support.',
    
    // Default
    'default': 'An error occurred. Please try again later.',
  };
  
  return errorMessages[code] || errorMessages['default'];
};

// Audit logging for sensitive operations
export const logAuditEvent = async (
  db: any,
  userId: string,
  userRole: string,
  operation: string,
  resource: string,
  status: 'success' | 'failure',
  details?: any
) => {
  try {
    await db.collection('audit_logs').add({
      userId,
      userRole,
      operation,
      resource,
      status,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};