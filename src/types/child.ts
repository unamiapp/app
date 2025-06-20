export interface ChildProfile {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  guardians?: string[];
  schoolName?: string;
  photoURL?: string;
  identificationNumber?: string;
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
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ChildAlert {
  id: string;
  childId: string;
  childName?: string;
  childAge?: number;
  childPhoto?: string;
  // Support both nested and flat structures for backward compatibility
  lastSeen?: {
    date: string;
    time?: string;
    location: string;
    description: string;
  };
  // Legacy flat fields
  lastSeenLocation?: string;
  lastSeenWearing?: string;
  lastSeenDate?: string;
  // Alert type can be stored in either field
  alertType?: string;
  type?: string;
  description?: string;
  // Additional fields from existing alerts
  clothingDescription?: string;
  contactPhone?: string;
  additionalInfo?: string;
  status: 'active' | 'resolved' | 'cancelled' | 'false';
  contactInfo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionDetails?: string;
  attachments?: string[];
}