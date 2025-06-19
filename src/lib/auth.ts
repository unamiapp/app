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
              
              // Create admin user with specified role
              return {
                id: 'admin-user',
                email: ADMIN_EMAIL,
                name: 'Admin User',
                role: credentials.role || 'admin',
                roles: ['admin', credentials.role || 'admin'].filter((v, i, a) => a.indexOf(v) === i),
              };
            }
            
            try {
              // Get admin user from Firebase
              const adminUser = await adminAuth.getUserByEmail(credentials.email);
              
              // Get user claims to check roles
              const userRecord = await adminAuth.getUser(adminUser.uid);
              const customClaims = userRecord.customClaims || {};
              
              // Determine role based on passed role or default to admin
              let role = credentials.role || 'admin';
              
              // For admin users, allow role switching
              if (customClaims.role === 'admin' || (customClaims.roles && customClaims.roles.includes('admin'))) {
                console.log('Admin user switching to role:', role);
              } else {
                // For non-admin users, enforce their assigned role
                role = customClaims.role || 'parent';
                console.log('Non-admin user using assigned role:', role);
              }
              
              return {
                id: adminUser.uid,
                email: adminUser.email,
                name: adminUser.displayName || 'User',
                role: role as UserRole,
                roles: customClaims.roles || [role],
              };
            } catch (error) {
              console.error('Admin authentication error:', error);
              return null;
            }
          } else {
            // For non-admin users, try to authenticate with Firebase
            try {
              // Get user from Firebase
              const userRecord = await adminAuth.getUserByEmail(credentials.email);
              
              // Get user claims to check roles
              const customClaims = userRecord.customClaims || {};
              
              // Use the user's assigned role
              const role = customClaims.role || 'parent';
              
              return {
                id: userRecord.uid,
                email: userRecord.email,
                name: userRecord.displayName || 'User',
                role: role as UserRole,
                roles: customClaims.roles || [role],
              };
            } catch (error) {
              console.error('User authentication error:', error);
              return null;
            }
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
        token.role = (user as any).role || 'admin';
        
        // Ensure roles is always an array that includes the primary role
        if ((user as any).roles && Array.isArray((user as any).roles)) {
          token.roles = (user as any).roles;
          // Make sure primary role is in the roles array
          if (!token.roles.includes(token.role)) {
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
      if (!token.role) token.role = 'admin';
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
      // If the URL is a dashboard URL, use it directly
      if (url.includes('/dashboard/')) {
        return url;
      }
      
      // If it's a generic dashboard URL, let the middleware handle it
      if (url === `${baseUrl}/dashboard`) {
        return url;
      }
      
      return url;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};