import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserRole } from '@/types/user';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { NextAuthOptions } from 'next-auth';

// Admin user credentials
const ADMIN_EMAIL = 'info@unamifoundation.org';

export const authOptions: NextAuthOptions = {
  providers: [
    // Only include Google provider if credentials are properly configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? 
      [GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        profile(profile) {
          // Check if Google login is the admin email
          const isAdmin = profile.email === ADMIN_EMAIL;
          
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            role: isAdmin ? 'admin' : 'parent',
          };
        }
      })] : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }, // Allow role to be passed from client
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Check if this is the admin user
          if (credentials.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            // For admin login with simple password
            if (credentials.password === 'Proof321#') {
              console.log('Admin login successful with role:', credentials.role || 'admin');
              
              // Create admin user with admin role by default
              return {
                id: 'admin-user',
                email: ADMIN_EMAIL,
                name: 'UNCIP Admin',
                role: 'admin', // Always default to admin role
                roles: ['admin'],
              };
            } else {
              console.log('Admin login failed - incorrect password');
              return null;
            }
          }
          
          // First, check if user exists in Firestore users collection
          try {
            const usersSnapshot = await adminDb.collection('users')
              .where('email', '==', credentials.email.toLowerCase())
              .limit(1)
              .get();
            
            if (!usersSnapshot.empty) {
              const userDoc = usersSnapshot.docs[0];
              const userData = userDoc.data();
              
              console.log('Found user in Firestore:', userData.email, 'Role:', userData.role);
              
              // For registered users, check if they have a password in Firestore
              // Try their stored password or fallback to demo123
              // Log password check for debugging
              console.log('Password check:', {
                hasStoredPassword: !!userData.password,
                passwordMatch: userData.password === credentials.password,
                isDemoPassword: credentials.password === 'demo123'
              });
              
              if ((userData.password && credentials.password === userData.password) || credentials.password === 'demo123') {
                // If user is admin, always use admin role
                let role = userData.role || 'parent';
                if (userData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || 
                    userData.role === 'admin' || 
                    (userData.roles && userData.roles.includes('admin'))) {
                  role = 'admin';
                }
                
                return {
                  id: userDoc.id,
                  email: userData.email,
                  name: userData.displayName || userData.firstName + ' ' + userData.lastName || userData.email.split('@')[0],
                  role: role as UserRole,
                  roles: [role],
                };
              } else {
                console.log('Incorrect password for Firestore user');
                return null;
              }
            }
          } catch (firestoreError) {
            console.error('Firestore user lookup error:', firestoreError);
          }
          
          // If not found in Firestore, try Firebase Auth
          try {
            // Get user from Firebase Auth
            const userRecord = await adminAuth.getUserByEmail(credentials.email);
            
            // Get user claims to check roles
            const customClaims = userRecord.customClaims || {};
            
            // Determine role based on passed role or user's assigned role
            let role = credentials.role || customClaims.role || 'parent';
            
            // For admin users, always use admin role
            if (credentials.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || 
                customClaims.role === 'admin' || 
                (customClaims.roles && customClaims.roles.includes('admin'))) {
              role = 'admin';
              console.log('Admin user using admin role');
            } else {
              // For non-admin users, enforce their assigned role
              role = customClaims.role || 'parent';
              console.log('Non-admin user using assigned role:', role);
            }
            
            return {
              id: userRecord.uid,
              email: userRecord.email,
              name: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
              role: role as UserRole,
              roles: customClaims.roles || [role],
            };
          } catch (firebaseError) {
            console.error('Firebase Auth error:', firebaseError);
            
            // If user doesn't exist in Firebase, create a temporary user for demo purposes
            if (credentials.password === 'demo123') {
              console.log('Creating temporary user for demo:', credentials.email, 'with role:', credentials.role);
              
              // Demo users get the role they selected, but admin email always gets admin role
              let role = 'parent';
              if (credentials.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                role = 'admin';
              } else if (credentials.role && credentials.role !== 'admin') {
                role = credentials.role;
              }
              console.log('Assigned role for demo user:', role);
              
              return {
                id: `temp-${credentials.email.replace('@', '-').replace('.', '-')}`,
                email: credentials.email,
                name: credentials.email.split('@')[0],
                role: role as UserRole,
                roles: [role],
              };
            }
            
            console.log('User not found in Firebase and password not demo123');
            return null;
          }
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle role updates from session
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
        // Make sure roles array includes the role
        if (!token.roles || !Array.isArray(token.roles)) {
          token.roles = [session.role];
        } else if (!token.roles.includes(session.role)) {
          token.roles = [...token.roles, session.role];
        }
      }
      
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'parent';
        
        // Ensure roles is always an array that includes the primary role
        if ((user as any).roles && Array.isArray((user as any).roles)) {
          token.roles = (user as any).roles || [];
          // Make sure primary role is in the roles array
          if (Array.isArray(token.roles) && !token.roles.includes(token.role)) {
            token.roles.push(token.role);
          }
        } else {
          token.roles = [token.role];
        }
        
        console.log('JWT token set:', { 
          id: token.id, 
          role: token.role, 
          roles: token.roles 
        });
      }
      
      // Always ensure token has role and roles properties
      // If user is admin email, always use admin role
      if (token.email === ADMIN_EMAIL) {
        token.role = 'admin';
      } else if (!token.role) {
        token.role = 'parent';
      }
      if (!token.roles) token.roles = [token.role];
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).roles = token.roles;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If the URL is relative to our domain, use it
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // If it's our domain, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Default fallback
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};