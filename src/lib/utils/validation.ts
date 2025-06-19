import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['parent', 'school', 'authority', 'community', 'admin']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Child profile validation schemas
export const childProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  gender: z.enum(['male', 'female', 'other']),
  identificationNumber: z.string().optional()
    .refine(val => !val || val.length >= 3, {
      message: 'Identification number must be at least 3 characters if provided',
    }),
  schoolName: z.string().optional(),
  photoURL: z.string().url().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  medicalInfo: z.object({
    bloodType: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    emergencyContact: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      relationship: z.string().min(2, 'Relationship must be at least 2 characters'),
      phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    }).optional(),
  }).optional(),
  guardians: z.array(z.string()).min(1, 'At least one guardian is required'),
});

// Alert validation schemas
export const alertSchema = z.object({
  childId: z.string().min(1, 'Child ID is required'),
  type: z.enum(['missing', 'medical', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  lastSeenLocation: z.object({
    address: z.string().min(5, 'Address must be at least 5 characters'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timestamp: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),
  }).optional(),
  lastSeenWearing: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
  contactInfo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    email: z.string().email('Invalid email address').optional(),
  }),
});