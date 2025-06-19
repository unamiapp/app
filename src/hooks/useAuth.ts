'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession, update } from 'next-auth/react';
import { UserProfile, UserRole } from '@/types/user';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string, role?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (session?.user) {
      // Create a user profile from session data
      const profile: UserProfile = {
        id: (session.user as any).id || 'unknown',
        email: session.user.email || '',
        displayName: session.user.name || '',
        photoURL: session.user.image || undefined,
        role: (session.user as any).role || 'parent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };
      
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }
    
    setLoading(false);
  }, [session, status, router]);

  const signUpUser = async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      // Check if Firebase auth is initialized
      if (!auth) {
        console.error('Firebase auth is not initialized');
        throw new Error('Authentication service is not available');
      }
      
      // First create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      console.log('User created in Firebase Auth:', userCredential.user);
      
      // Create a user document in Firestore using our API
      try {
        const response = await fetch('/api/admin-sdk/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            displayName,
            role,
            id: userCredential.user.uid
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to create user in Firestore:', await response.text());
        } else {
          console.log('User created in Firestore');
        }
      } catch (error) {
        console.error('Error creating user in Firestore:', error);
      }
      
      // Sign in directly without using NextAuth
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect to dashboard
      router.push(`/dashboard/${role}`);
      
      return;
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use. Please try logging in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.code === 'auth/api-key-not-valid') {
        throw new Error('Authentication service is temporarily unavailable. Please try again later.');
      } else {
        throw error;
      }
    }
  };

  const signInUser = async (email: string, password: string, role?: string) => {
    try {
      // Check if Firebase auth is initialized
      if (!auth) {
        console.error('Firebase auth is not initialized');
        throw new Error('Authentication service is not available');
      }
      
      // Sign in directly with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in with Firebase:', userCredential.user);
      
      // Redirect to dashboard
      router.push(role ? `/dashboard/${role}` : '/dashboard');
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw error;
      }
    }
  };

  const signInWithGoogleUser = async () => {
    try {
      // Check if Firebase auth is initialized
      if (!auth) {
        console.error('Firebase auth is not initialized');
        throw new Error('Authentication service is not available');
      }
      
      // Sign in with Firebase Auth
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in with Google:', result.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.code === 'auth/api-key-not-valid') {
        throw new Error('Authentication service is temporarily unavailable. Please try again later.');
      } else {
        throw error;
      }
    }
  };

  const logoutUser = async () => {
    try {
      // Sign out from Firebase Auth if it's initialized
      if (auth) {
        await auth.signOut();
      }
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPasswordUser = async (email: string) => {
    try {
      // Check if Firebase auth is initialized
      if (!auth) {
        console.error('Firebase auth is not initialized');
        throw new Error('Authentication service is not available');
      }
      
      // Send password reset email via Firebase Auth
      await sendPasswordResetEmail(auth, email);
      return Promise.resolve();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const switchRole = async (role: UserRole) => {
    try {
      if (!session) throw new Error('No active session');
      
      // Update session with new role
      await updateSession({
        ...session,
        user: {
          ...session.user,
          role
        }
      });
      
      // Redirect to the appropriate dashboard
      router.push(`/dashboard/${role}`);
    } catch (error) {
      console.error('Error switching role:', error);
      throw error;
    }
  };

  const value = {
    user: session?.user || null,
    userProfile,
    loading: loading || status === 'loading',
    signUp: signUpUser,
    signIn: signInUser,
    signInWithGoogle: signInWithGoogleUser,
    logout: logoutUser,
    resetPassword: resetPasswordUser,
    switchRole,
  };

  return React.createElement(AuthContext.Provider, { value: value as AuthContextType }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};