/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import ModeToggle from "@/components/ModeToggle";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [checkboxToggle, setCheckboxToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Email validation helper
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  return (
    <div className="relative p-4 sm:p-8 md:p-12 pb-2 sm:pb-2 md:pb-2 bg-white dark:bg-gray-900 z-1 min-h-screen">
      <div className="relative flex flex-col justify-center w-full min-h-[80vh] sm:p-0 lg:flex-row gap-8">
        {/* Form */}
        <div className="flex flex-col flex-1 w-full lg:w-1/2 bg-white dark:bg-gray-900 px-4 sm:px-8 md:px-12 py-4 sm:py-6 justify-center">
          <div className="w-full max-w-md pt-2 mx-auto">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-8"
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
              Back to dashboard
            </Link>
          </div>
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-4 sm:mb-6">
                <h1 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-title-sm sm:text-title-md">
                  Sign In
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email and password to sign in!
                </p>
              </div>
              <div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 mb-4">
                  <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 dark:text-white/90 transition-colors bg-gray-100 dark:bg-gray-800 rounded-lg px-7 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                        fill="#EB4335"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                  <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 dark:text-white/90 transition-colors bg-gray-100 dark:bg-gray-800 rounded-lg px-7 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white">
                    <svg
                      width="21"
                      className="fill-current"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                    </svg>
                    Sign in with X
                  </button>
                </div>
                <div className="relative py-2 sm:py-3 mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="p-2 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                      Or
                    </span>
                  </div>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setError('');
                  setSuccess('');
                  // Client-side validation
                  if (!formData.email || !formData.password) {
                    setError('Please fill in both email and password.');
                    return;
                  }
                  if (!isValidEmail(formData.email)) {
                    setError('Please enter a valid email address.');
                    return;
                  }
                  setIsLoading(true);
                  // Simulate async login (replace with real API call)
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                  // Mocked login logic
                  if (
                    formData.email === 'user@example.com' &&
                    formData.password === 'password123'
                  ) {
                    setSuccess('Login successful! Redirecting...');
                    setIsLoading(false);
                    setTimeout(() => {
                      router.push('/profile');
                    }, 1200);
                  } else {
                    setError('Invalid email or password.');
                    setIsLoading(false);
                  }
                }}>
                  <div className="space-y-6">
                    {/* Email */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Email<span className="text-error-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="info@gmail.com"
                        className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 text-sm text-gray-800 dark:text-white/90 shadow-theme-xs placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-brand-300 dark:focus:border-brand-800 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                        required
                      />
                    </div>
                    {/* Password */}
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Password<span className="text-error-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter your password"
                          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 text-sm text-gray-800 dark:text-white/90 shadow-theme-xs placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-brand-300 dark:focus:border-brand-800 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 py-2.5 pl-4 pr-11"
                          required
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 text-gray-500 dark:text-gray-400 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {!showPassword ? (
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z"
                                fill="#98A2B3"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z"
                                fill="#98A2B3"
                              />
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>
                    {/* Checkbox */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label
                          htmlFor="checkboxLabelOne"
                          className="flex items-center text-sm font-normal text-gray-700 dark:text-gray-400 cursor-pointer select-none"
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              id="checkboxLabelOne"
                              className="sr-only"
                              onChange={() => setCheckboxToggle(!checkboxToggle)}
                            />
                            <div
                              className={`mr-3 flex h-5 w-5 items-center justify-center rounded-md border-[1.25px] ${checkboxToggle ? 'border-brand-500 bg-brand-500' : 'bg-transparent border-gray-300 dark:border-gray-700'}`}
                            >
                              <span className={checkboxToggle ? '' : 'opacity-0'}>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                                    stroke="white"
                                    strokeWidth="1.94437"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                          Keep me logged in
                        </label>
                      </div>
                      <Link
                        href="/forget-password"
                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    {/* Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 shadow-lg hover:from-brand-600 hover:to-brand-800 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing In...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </button>
                    </div>
                    {/* Error/Success Messages */}
                    {(error || success) && (
                      <div className={`mt-3 text-sm ${error ? 'text-red-500' : 'text-green-600'}`}>{error || success}</div>
                    )}
                  </div>
                </form>
                <div className="mt-4">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Don't have an account?
                    <Link
                      href="/register"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400 ml-1"
                    >
                      Sign Up
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-5">Welcome Back!</h2>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                Log in to access your dashboard and continue where you left off.
              </p>
              <span className="inline-block mt-2 text-brand-500 dark:text-brand-400 text-3xl">👋</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
