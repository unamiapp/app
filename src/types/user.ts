export type UserRole = 'parent' | 'school' | 'authority' | 'community' | 'admin';

export interface Organization {
  id: string;
  name: string;
  type: 'school' | 'authority' | 'community';
  address?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export interface UserProfile {
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

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  roles?: UserRole[];
}