/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ChangePassword() {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission
  const router = useRouter();
  const { user, isLoading, changePassword } = useAuth();
  console.log('ChangePassword Component Rendered', { user, isLoading, isSubmitting });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!user?.email) {
      setError('User email not available');
      return;
    }
    setError('');
    setSuccess('');
    setIsSubmitting(true); // Set submitting state to true
    const result = await changePassword(user.email, formData.currentPassword, formData.newPassword);
    if (result.success) {
      setSuccess('Password changed successfully! Redirecting...');
      setTimeout(() => {
        setIsSubmitting(false); // Reset submitting state after redirect
        router.push('/account-settings/security');
      }, 1500);
    } else {
      setIsSubmitting(false); // Reset submitting state on error
      setError(result.error || 'Failed to change password');
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }
    const node = contentRef.current;
    if (!node) return;
    if ('IntersectionObserver' in window) {
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    } else {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('Auth State:', { user, isLoading, isSubmitting });
    const timeout = setTimeout(() => {
      if (isLoading) {
        setError('Authentication timed out. Please try again.');
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  if (isLoading && !isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#F7FBFC] via-[#FFFFFF] to-[#EEF7F6] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="max-w-md w-full p-8">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FBFC] via-[#FFFFFF] to-[#EEF7F6] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
      <div
        ref={contentRef}
        suppressHydrationWarning
        className={`flex min-h-screen transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="flex w-full lg:w-1/2">
          <div className="flex flex-col justify-center w-full max-w-md mx-auto px-6 py-12 relative">
            <div className="mb-8">
              <Link
                href="/account-settings/security"
                className="inline-flex items-center text-sm text-[#475569] dark:text-[#9FB3C8] hover:text-[#1E5AA8] dark:hover:text-[#6EE7D8] transition-colors mb-6"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Security
              </Link>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Change Password</h2>
                <p className="text-[#475569] dark:text-[#9FB3C8]">Create a new strong password for your account</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              {isSubmitting && (
                <div className="absolute inset-0 bg-[#F7FBFC]/70 dark:bg-[#0B1C2D]/70 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-[#2FD1C5] border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-[#6EE7D8] border-t-transparent rounded-full animate-[spin_1.5s_ease-in-out_infinite]"></div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-[#475569] dark:text-[#9FB3C8]">Updating Password...</p>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-[#475569] dark:text-[#9FB3C8] mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-[#DCEEEE] dark:border-[#1E3A4A] rounded-lg bg-[#FFFFFF] dark:bg-[#0B1C2D] text-[#0F172A] dark:text-[#E6F1F5] placeholder-[#7B8A9A] dark:placeholder-[#9FB3C8] focus:ring-2 focus:ring-[#2FD1C5] focus:border-transparent transition-colors"
                    placeholder="Enter your current password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7B8A9A] dark:text-[#9FB3C8] hover:text-[#1E5AA8] dark:hover:text-[#6EE7D8]"
                    disabled={isSubmitting}
                  >
                    {showPassword.current ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#475569] dark:text-[#9FB3C8] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-[#DCEEEE] dark:border-[#1E3A4A] rounded-lg bg-[#FFFFFF] dark:bg-[#0B1C2D] text-[#0F172A] dark:text-[#E6F1F5] placeholder-[#7B8A9A] dark:placeholder-[#9FB3C8] focus:ring-2 focus:ring-[#2FD1C5] focus:border-transparent transition-colors"
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7B8A9A] dark:text-[#9FB3C8] hover:text-[#1E5AA8] dark:hover:text-[#6EE7D8]"
                    disabled={isSubmitting}
                  >
                    {showPassword.new ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#7B8A9A] dark:text-[#9FB3C8]">
                  Must be at least 6 characters
                </p>
              </div>

              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#475569] dark:text-[#9FB3C8] mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-[#DCEEEE] dark:border-[#1E3A4A] rounded-lg bg-[#FFFFFF] dark:bg-[#0B1C2D] text-[#0F172A] dark:text-[#E6F1F5] placeholder-[#7B8A9A] dark:placeholder-[#9FB3C8] focus:ring-2 focus:ring-[#2FD1C5] focus:border-transparent transition-colors"
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7B8A9A] dark:text-[#9FB3C8] hover:text-[#1E5AA8] dark:hover:text-[#6EE7D8]"
                    disabled={isLoading}
                  >
                    {showPassword.confirm ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/account-settings/security')}
                  className="px-4 py-2 cursor-pointer bg-[#EEF7F6] hover:bg-[#DCEEEE] dark:bg-[#0B1C2D] dark:hover:bg-[#102A3A] text-[#475569] dark:text-[#9FB3C8] font-medium rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:to-[#1E5AA8] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B1C2D] via-[#1E5AA8] to-[#0A2A66] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="max-w-md text-center text-white px-8">
              <div className="mb-8">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">Secure Your Account</h2>
                <p className="text-[#9FB3C8] text-lg">Regularly updating your password helps protect your account.</p>
              </div>
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[#E6F1F5]">Use a strong, unique password</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[#E6F1F5]">Avoid reusing passwords across sites</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[#E6F1F5]">Consider using a password manager</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
