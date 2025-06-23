'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { signIn, useSession } from 'next-auth/react';

interface LoginFormData {
  email: string;
  password: string;
  role?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');
      
      let redirectTo;
      if (callbackUrl) {
        redirectTo = decodeURIComponent(callbackUrl);
      } else {
        const userRole = (session.user as any)?.role || 'admin';
        redirectTo = `/dashboard/${userRole}`;
      }
      
      console.log('User already authenticated, redirecting to:', redirectTo);
      window.location.replace(redirectTo);
    }
  }, [session, status]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>();
  
  // Set default role
  const setRole = (role: string) => {
    setValue('role', role);
  };
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Get the callback URL from the URL params or use default
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callbackUrl');
    
    let redirectTo;
    if (callbackUrl) {
      redirectTo = decodeURIComponent(callbackUrl);
    } else {
      redirectTo = data.role ? `/dashboard/${data.role}` : '/dashboard/admin';
    }
    
    console.log('Attempting login with redirect to:', redirectTo);
    
    // Use NextAuth's built-in redirect functionality
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      role: data.role || 'admin',
      callbackUrl: redirectTo
    });
    
    // If we reach here, there was an error (successful login would have redirected)
    console.error('Login failed:', result);
    toast.error('Login failed. Please check your credentials.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-700">UNCIP</h1>
        <h2 className="mt-2 text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/auth/register" className="font-medium text-blue-700 hover:text-blue-800">
            Create one now
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Hidden role field */}
            <input type="hidden" {...register('role')} />

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Select Role</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className="w-full inline-flex justify-center py-2 px-4 border border-blue-200 rounded-md shadow-sm bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('parent')}
                className="w-full inline-flex justify-center py-2 px-4 border border-green-200 rounded-md shadow-sm bg-green-50 text-sm font-medium text-green-700 hover:bg-green-100"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setRole('school')}
                className="w-full inline-flex justify-center py-2 px-4 border border-yellow-200 rounded-md shadow-sm bg-yellow-50 text-sm font-medium text-yellow-700 hover:bg-yellow-100"
              >
                School
              </button>
              <button
                type="button"
                onClick={() => setRole('authority')}
                className="w-full inline-flex justify-center py-2 px-4 border border-red-200 rounded-md shadow-sm bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Authority
              </button>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600 mb-2">
                <strong>Demo Credentials:</strong>
              </p>
              <p className="text-xs text-gray-600">
                Admin: info@unamifoundation.org / Proof321#<br/>
                Demo: any-email@example.com / demo123
              </p>
            </div>
            <p className="mt-2 text-xs text-center text-gray-500">
              Select your role before signing in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}