/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
// import ModeToggle from "@/components/ModeToggle";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      setIsSubmitted(true);
      setShowSuccessAnimation(true);
      
      // Hide success animation after 3 seconds
      setTimeout(() => setShowSuccessAnimation(false), 3000);
      
      console.log('Password reset requested for:', email);
    } catch (error) {
      setIsLoading(false);
      setEmailError('Something went wrong. Please try again.');
      console.error('Password reset error:', error);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail('');
    setEmailError('');
  };

  return (
    <div className="relative p-4 sm:p-8 md:p-12 pb-2 sm:pb-2 md:pb-2 bg-white dark:bg-gray-900 z-1 min-h-screen">
      <div className="relative flex flex-col justify-center w-full min-h-[80vh] sm:p-0 lg:flex-row gap-8">
        {/* Form */}
        <div className="flex flex-col flex-1 w-full lg:w-1/2 bg-white dark:bg-gray-900 px-4 sm:px-8 md:px-12 py-4 sm:py-6 justify-center">
          <div className="w-full max-w-md pt-2 mx-auto">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                className="stroke-current"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Sign In
            </Link>
          </div>
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Forgot Password
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              <div>
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Email<span className="text-error-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email address"
                        className={`dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 transition-colors ${
                          emailError 
                            ? 'border-red-300 focus:border-red-300 dark:border-red-600 dark:focus:border-red-600' 
                            : 'border-gray-300 focus:border-brand-300'
                        }`}
                        required
                      />
                      {emailError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {emailError}
                        </p>
                      )}
                    </div>
                    {/* Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 transition-all duration-500 ${
                        showSuccessAnimation 
                          ? 'bg-green-100 dark:bg-green-900 scale-110' 
                          : 'bg-green-100 dark:bg-green-900'
                      }`}>
                        <svg className={`h-8 w-8 text-green-600 dark:text-green-400 transition-all duration-500 ${
                          showSuccessAnimation ? 'scale-110' : ''
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Check your email
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        We've sent a password reset link to{' '}
                        <span className="font-medium text-gray-900 dark:text-white break-all">
                          {email}
                        </span>
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={handleTryAgain}
                          className="w-full px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                        >
                          Didn't receive the email? Try again
                        </button>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          <p>• Check your spam folder</p>
                          <p>• Make sure you entered the correct email address</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-5">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Remember your password?{' '}
                    <Link
                      href="/login"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative items-center hidden w-full h-full bg-gradient-to-br from-brand-950/80 to-brand-800/60 dark:from-white/10 dark:to-white/0 lg:grid lg:w-1/2 p-6 sm:p-10">
          <div className="flex items-center justify-center w-full h-full">
            <div className="flex flex-col items-center justify-center max-w-md w-full text-center px-10 py-16 sm:px-14 sm:py-20 bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-2xl backdrop-blur-md border border-white/30 dark:border-gray-700/30">
              <Link href="/" className="block mb-10">
                <img src="/logo.png" alt="Logo" className="mx-auto w-20 h-20 object-contain" />
              </Link>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-5">Forgot your password?</h2>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                Enter your email to receive a password reset link and regain access to your account.
              </p>
              <span className="inline-block mt-2 text-brand-500 dark:text-brand-400 text-3xl">🔒</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 