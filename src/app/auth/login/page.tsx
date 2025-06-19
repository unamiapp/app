'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';

interface LoginFormData {
  email: string;
  password: string;
  role?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>();
  
  // Helper functions to pre-fill credentials for different roles
  const fillAdminCredentials = () => {
    setValue('email', 'info@unamifoundation.org');
    setValue('password', 'Proof321#');
    setValue('role', 'admin');
  };
  
  const fillParentCredentials = () => {
    setValue('email', 'info@unamifoundation.org');
    setValue('password', 'Proof321#');
    setValue('role', 'parent');
  };
  
  const fillSchoolCredentials = () => {
    setValue('email', 'info@unamifoundation.org');
    setValue('password', 'Proof321#');
    setValue('role', 'school');
  };
  
  const fillAuthorityCredentials = () => {
    setValue('email', 'info@unamifoundation.org');
    setValue('password', 'Proof321#');
    setValue('role', 'authority');
  };
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        role: data.role || 'admin'
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      toast.success('Signed in successfully!');
      
      // Redirect to the appropriate dashboard based on role
      const redirectTo = data.role ? `/dashboard/${data.role}` : '/dashboard/admin';
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #EFF6FF, #DBEAFE)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '28rem',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: '#1D4ED8',
          marginBottom: '0.5rem'
        }}>UNCIP</h1>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1E293B',
          marginBottom: '1.5rem'
        }}>Welcome Back</h2>
        <p style={{color: '#64748B'}}>
          Don't have an account?{' '}
          <Link href="/auth/register" style={{
            color: '#1D4ED8',
            fontWeight: '500',
            textDecoration: 'none'
          }}>
            Create one now
          </Link>
        </p>
      </div>

      <div style={{
        maxWidth: '28rem',
        margin: '2rem auto 0',
        width: '100%'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
          padding: '2rem',
          border: '1px solid #E2E8F0'
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{marginBottom: '1.5rem'}}>
            <div style={{marginBottom: '1.5rem'}}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <label htmlFor="email" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1E293B'
                }}>
                  Email address
                </label>
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: errors.email ? '1px solid #EF4444' : '1px solid #E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                placeholder="info@unamifoundation.org (default)"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p style={{color: '#EF4444', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <label htmlFor="password" style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1E293B'
                }}>
                  Password
                </label>
                <Link href="/auth/forgot-password" style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1D4ED8',
                  textDecoration: 'none'
                }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingRight: '2.5rem',
                    border: errors.password ? '1px solid #EF4444' : '1px solid #E2E8F0',
                    borderRadius: '0.375rem',
                    fontSize: '1rem'
                  }}
                  placeholder="Proof321# (default)"
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
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{color: '#EF4444', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Hidden role field */}
            <input type="hidden" {...register('role')} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                style={{
                  height: '1.25rem',
                  width: '1.25rem',
                  borderRadius: '0.25rem',
                  borderColor: '#E2E8F0'
                }}
              />
              <label htmlFor="remember-me" style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                color: '#1E293B'
              }}>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: '#1D4ED8',
                color: 'white',
                borderRadius: '0.375rem',
                fontWeight: '500',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    borderTop: '2px solid white',
                    borderRight: '2px solid transparent',
                    marginRight: '0.5rem',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div>
            <div style={{
              position: 'relative',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#E2E8F0'
              }}></div>
              <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <span style={{
                  backgroundColor: 'white',
                  padding: '0 1rem',
                  color: '#64748B',
                  fontSize: '0.875rem'
                }}>Access Different Dashboards</span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  fillAdminCredentials();
                  handleSubmit(onSubmit)();
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Admin Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  fillParentCredentials();
                  handleSubmit(onSubmit)();
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  border: '1px solid #BBF7D0',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Parent Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  fillSchoolCredentials();
                  handleSubmit(onSubmit)();
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  border: '1px solid #FDE68A',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                School Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  fillAuthorityCredentials();
                  handleSubmit(onSubmit)();
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Authority Dashboard
              </button>
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#64748B',
              textAlign: 'center',
              marginTop: '0.5rem'
            }}>
              All dashboards use the same admin account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}