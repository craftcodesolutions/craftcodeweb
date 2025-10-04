/* eslint-disable react/no-unescaped-entities */

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Define page states for better organization
type PageState = 'loading' | 'valid' | 'invalid' | 'used' | 'success' | 'no-token';

// Component interfaces
interface FormData {
  password: string;
  confirmPassword: string;
}

interface Errors {
  password: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  feedback: string;
}

// Loading Component
const LoadingComponent = () => (
  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
    <div className="flex items-center">
      <svg className="animate-spin w-5 h-5 text-blue-400 mr-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <div className="text-sm text-blue-700 dark:text-blue-400">
        Validating reset token...
      </div>
    </div>
  </div>
);

// No Token Component
const NoTokenComponent = () => (
  <div className="space-y-5 text-center">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-red-100 dark:bg-red-900">
      <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No Reset Token Provided
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      A valid reset token is required to reset your password. Please use the link from your email.
    </p>
    <div className="space-y-3">
      <Link
        href="/forgot-password"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Request Reset Link
      </Link>
      <div>
        <Link
          href="/login"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  </div>
);

// Invalid Token Component
const InvalidTokenComponent = ({ tokenError }: { tokenError: string }) => (
  <div className="space-y-5 text-center">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-red-100 dark:bg-red-900">
      <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Invalid Reset Token
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
      {tokenError}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      This reset link may have expired or already been used. Please request a new password reset.
    </p>
    <div className="space-y-3">
      <Link
        href="/forgot-password"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-red-600 hover:bg-red-700 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Request New Reset Link
      </Link>
      <div>
        <Link
          href="/login"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  </div>
);

// Token Used Component
const TokenUsedComponent = () => (
  <div className="space-y-5 text-center">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-orange-100 dark:bg-orange-900">
      <svg className="h-8 w-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Reset Link Already Used
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      This password reset link has already been used and is no longer valid. For security reasons, each reset link can only be used once.
    </p>
    <div className="space-y-3">
      <Link
        href="/forgot-password"
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-orange-600 hover:bg-orange-700 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Request New Reset Link
      </Link>
      <div>
        <Link
          href="/login"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  </div>
);

// Success Component
const SuccessComponent = ({ showAnimation }: { showAnimation: boolean }) => (
  <div className="space-y-5 text-center">
    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 transition-all duration-500 ${showAnimation ? 'bg-green-100 dark:bg-green-900 scale-110' : 'bg-green-100 dark:bg-green-900'}`}>
      <svg className={`h-8 w-8 text-green-600 dark:text-green-400 transition-all duration-500 ${showAnimation ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      Password Reset Successful
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      Your password has been successfully reset. You can now sign in with your new password.
    </p>
    <Link
      href="/login"
      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98]"
    >
      Sign In Now
    </Link>
  </div>
);

// Valid Token Component - The main form
interface ValidTokenProps {
  userEmail: string;
  formData: FormData;
  errors: Errors;
  passwordStrength: PasswordStrength;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  onInputChange: (field: 'password' | 'confirmPassword', value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  getStrengthColor: (score: number) => string;
  getStrengthTextColor: (score: number) => string;
}

const ValidTokenComponent = ({
  userEmail,
  formData,
  errors,
  passwordStrength,
  showPassword,
  showConfirmPassword,
  isLoading,
  onInputChange,
  onSubmit,
  onTogglePassword,
  onToggleConfirmPassword,
  getStrengthColor,
  getStrengthTextColor
}: ValidTokenProps) => (
  <>
    {/* Token Valid Confirmation */}
    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex">
        <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <div className="text-sm text-green-700 dark:text-green-400">
          <p>Reset link verified for: <strong>{userEmail}</strong></p>
          <p className="mt-1">You can now set your new password below.</p>
        </div>
      </div>
    </div>
    
    {/* Form Error Messages */}
    {(errors.password || errors.confirmPassword) && (
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-red-700 dark:text-red-400">
            {errors.password && <p>{errors.password}</p>}
            {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>
    )}

    <form onSubmit={onSubmit} className="space-y-6">
      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter your new password"
            required
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Password strength:</span>
              <span className={`text-xs font-medium ${getStrengthTextColor(passwordStrength.score)}`}>
                {passwordStrength.feedback}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              <p>• At least 8 characters</p>
              <p>• Include uppercase, lowercase, numbers, and symbols</p>
            </div>
          </div>
        )}
      </div>
      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => onInputChange('confirmPassword', e.target.value)}
            className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              formData.confirmPassword && formData.password === formData.confirmPassword
                ? 'border-green-300 dark:border-green-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Confirm your new password"
            required
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {/* Password Match Indicator */}
        {formData.confirmPassword && (
          <div className="mt-1 flex items-center">
            {formData.password === formData.confirmPassword ? (
              <>
                <svg className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-green-600 dark:text-green-400">Passwords match</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-red-600 dark:text-red-400">Passwords don't match</span>
              </>
            )}
          </div>
        )}
      </div>
      {/* Button */}
      <button
        type="submit"
        disabled={isLoading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword || passwordStrength.score < 3}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  </>
);

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [pageState, setPageState] = useState<PageState>('loading');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 0) feedback = 'Very weak';
    else if (score === 1) feedback = 'Weak';
    else if (score === 2) feedback = 'Fair';
    else if (score === 3) feedback = 'Good';
    else if (score === 4) feedback = 'Strong';
    else feedback = 'Very strong';

    return { score, feedback };
  };

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('No reset token provided');
        setPageState('no-token');
        return;
      }

      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.isValid) {
          setUserEmail(data.userEmail || '');
          setTokenError('');
          setPageState('valid');
        } else {
          // Check if the error indicates the token was already used
          if (data.error && (data.error.includes('already been used') || data.error.includes('No valid reset tokens found'))) {
            setTokenError('This reset link has already been used or expired');
            setPageState('used');
          } else {
            setTokenError(data.error || 'Invalid or expired reset token');
            setPageState('invalid');
          }
        }
      } catch {
        setTokenError('Failed to validate reset token');
        setPageState('invalid');
      }
    };

    validateToken();
  }, [token]);

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength({ score: 0, feedback: '' });
    }
  }, [formData.password]);

  const validateForm = () => {
    const newErrors = { password: '', confirmPassword: '' };

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !newErrors.password && !newErrors.confirmPassword;
  };

  const handleInputChange = (field: 'password' | 'confirmPassword', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!token) {
      setErrors(prev => ({ ...prev, password: 'Invalid reset token' }));
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the password reset API
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if the error indicates the token was already used
        if (data.error && (data.error.includes('Invalid or expired reset token') || data.error.includes('already been used'))) {
          setTokenError('This reset link has already been used or expired');
          setPageState('used');
          return;
        }
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsLoading(false);
      setShowSuccessAnimation(true);
      setPageState('success');
      
      // Hide success animation after 3 seconds
      setTimeout(() => setShowSuccessAnimation(false), 3000);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      setErrors(prev => ({ ...prev, password: error instanceof Error ? error.message : 'Something went wrong. Please try again.' }));
    }
  };

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthTextColor = (score: number) => {
    if (score <= 1) return 'text-red-600 dark:text-red-400';
    if (score === 2) return 'text-orange-600 dark:text-orange-400';
    if (score === 3) return 'text-yellow-600 dark:text-yellow-400';
    if (score === 4) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  // Render different components based on page state
  const renderPageContent = () => {
    switch (pageState) {
      case 'loading':
        return <LoadingComponent />;
      case 'no-token':
        return <NoTokenComponent />;
      case 'invalid':
        return <InvalidTokenComponent tokenError={tokenError} />;
      case 'used':
        return <TokenUsedComponent />;
      case 'success':
        return <SuccessComponent showAnimation={showSuccessAnimation} />;
      case 'valid':
        return (
          <ValidTokenComponent
            userEmail={userEmail}
            formData={formData}
            errors={errors}
            passwordStrength={passwordStrength}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            getStrengthColor={getStrengthColor}
            getStrengthTextColor={getStrengthTextColor}
          />
        );
      default:
        return <LoadingComponent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex w-full lg:w-1/2">
          <div className="flex flex-col justify-center w-full max-w-md mx-auto px-6 py-12">
            <div className="mb-8">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-6"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Sign In
              </Link>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your new password below.
                </p>
              </div>
            </div>
            {/* Render content based on page state */}
            {renderPageContent()}
            
            {/* Footer - only show for non-error states */}
            {pageState !== 'used' && pageState !== 'invalid' && pageState !== 'no-token' && pageState !== 'success' && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Right Side - Hero */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="max-w-md text-center text-white px-8">
              <div className="mb-8">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-4">Reset your password</h2>
                <p className="text-blue-100 text-lg">
                  Enter a new password to regain access to your account securely.
                </p>
              </div>
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100">Strong password required</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100">Instant access after reset</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}