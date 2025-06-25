'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import LoginForm from '@/components/auth/LoginForm';

interface LoginFormData {
  email: string;
  password: string;
  role?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('parent');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      role: 'parent'
    }
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setCallbackUrl(urlParams.get('callbackUrl'));
    }
  }, []);

  // Show loading while checking authentication status
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message for authenticated users instead of redirecting
  if (status === 'authenticated' && session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">UNCIP</h1>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold text-gray-800">Already Signed In</h2>
          <p className="mt-2 text-sm text-gray-500">
            You are already authenticated as {session.user.email}
          </p>
          <div className="mt-6 space-y-3">
            {callbackUrl ? (
              <a
                href={decodeURIComponent(callbackUrl)}
                className="inline-flex w-full justify-center items-center rounded-lg border border-transparent bg-blue-700 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Continue to Dashboard
              </a>
            ) : (
              <a
                href={`/dashboard/${(session.user as any)?.role || 'parent'}`}
                className="inline-flex w-full justify-center items-center rounded-lg border border-transparent bg-blue-700 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Go to Dashboard
              </a>
            )}
            <Button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              variant="outline"
              fullWidth
              responsive
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Set role and update state
  const setRole = (role: string) => {
    setSelectedRole(role);
  };
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    let redirectTo;
    if (callbackUrl) {
      redirectTo = decodeURIComponent(callbackUrl);
    } else {
      redirectTo = data.role ? `/dashboard/${data.role}` : '/dashboard/parent';
    }
    
    console.log('Attempting login with redirect to:', redirectTo);
    
    // Use selected role or form data role, default to parent
    const userRole = selectedRole || data.role || 'parent';
    
    console.log('Login attempt - Email:', data.email, 'Role:', userRole);
    
    // Use NextAuth's built-in redirect functionality
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      role: userRole,
      callbackUrl: redirectTo
    });
    
    // If we reach here, there was an error (successful login would have redirected)
    if (result?.error) {
      console.error('Login failed:', result.error);
      toast.error('Login failed. Please check your credentials.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">UNCIP Login</h1>
        <h2 className="mt-2 text-base sm:text-lg text-gray-600">Unami National Child Identification Program</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="auth" className="w-full" padding="lg">
          <CardContent className="pt-2 px-0">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email address"
                type="email"
                id="email"
                placeholder="Enter your email"
                error={errors.email?.message}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                }
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  showPasswordToggle={true}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
              </div>

              {/* Hidden role field */}
              <input type="hidden" value={selectedRole} {...register('role')} />

              <Checkbox
                id="remember-me"
                name="remember-me"
                label="Remember me"
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                responsive
                isLoading={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <Divider text="Select Role" className="my-6" />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`w-full inline-flex justify-center py-2.5 px-4 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
                  selectedRole === 'admin' 
                    ? 'border-blue-500 bg-blue-100 text-blue-800' 
                    : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`w-full inline-flex justify-center py-2.5 px-4 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
                  selectedRole === 'parent' 
                    ? 'border-green-500 bg-green-100 text-green-800' 
                    : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setRole('school')}
                className={`w-full inline-flex justify-center py-2.5 px-4 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
                  selectedRole === 'school' 
                    ? 'border-yellow-500 bg-yellow-100 text-yellow-800' 
                    : 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                School
              </button>
              <button
                type="button"
                onClick={() => setRole('authority')}
                className={`w-full inline-flex justify-center py-2.5 px-4 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
                  selectedRole === 'authority' 
                    ? 'border-red-500 bg-red-100 text-red-800' 
                    : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Authority
              </button>
            </div>
            
            <div className="mt-5 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Login Instructions:</strong>
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">New Users:</span> any-email@example.com / demo123
              </p>
              <p className="text-xs text-gray-600 mt-2 font-semibold text-blue-600">
                <span className="font-semibold">Registered Users:</span> Use your email with password "demo123"
              </p>
              <div className="mt-2 text-xs text-gray-600">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
                  Forgot your password? Click here to reset it
                </Link>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Selected role: <span className="font-semibold capitalize text-gray-700">{selectedRole}</span>
              </p>
              <p className="mt-4 text-xs text-gray-500">
                Don't have an account?{' '}
                <Link href="/auth/register" className="font-medium text-blue-700 hover:text-blue-800">
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}