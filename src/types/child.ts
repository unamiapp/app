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
  childName: string;
  childAge: number;
  childPhoto?: string;
  lastSeen: {
    date: string;
    location: string;
    description: string;
  };
  status: 'active' | 'resolved' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionDetails?: string;
}