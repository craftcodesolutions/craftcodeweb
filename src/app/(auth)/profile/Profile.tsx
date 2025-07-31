/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useState, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profileImage: string;
  publicId?: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  image: string;
}

export default function ProfileDynamic(): JSX.Element {
  const { user, isAuthenticated, isLoading: authLoading, error: authError, logout, updateProfile } = useAuth();
  const router = useRouter();

  const initialUser: UserProfile = {
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@example.com',
    bio: user?.bio || '',
    profileImage: user?.profileImage || 'https://placehold.co/128x128/000000/FFFFFF?text=Profile',

  };

  const [userProfile, setUserProfile] = useState<UserProfile>(initialUser);
  const [bio, setBio] = useState<string>(initialUser.bio);
  const [errors, setErrors] = useState<FormErrors>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    image: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>(initialUser.profileImage);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string>(initialUser.publicId || '');

  useEffect(() => {
    if (user) {
      console.log('User data from AuthContext:', user);
      const newUserProfile: UserProfile = {
        firstName: user.firstName || 'John',
        lastName: user.lastName || 'Doe',
        email: user.email || 'john.doe@example.com',
        bio: user.bio || '',
        profileImage: user.profileImage || 'https://placehold.co/128x128/000000/FFFFFF?text=Profile',
      };
      setUserProfile(newUserProfile);
      setBio(newUserProfile.bio);
      setCloudinaryUrl(newUserProfile.profileImage);
      setCloudinaryPublicId(newUserProfile.publicId || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      firstName: '',
      lastName: '',
      email: '',
      bio: '',
      image: '',
    };
    let isValid: boolean = true;

    if (!userProfile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (!userProfile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!userProfile.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userProfile.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    if (userProfile.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    if (name === 'bio') {
      setBio(value);
      setUserProfile((prev: UserProfile) => ({ ...prev, bio: value }));
    } else {
      setUserProfile((prev: UserProfile) => ({ ...prev, [name]: value }));
    }
    setErrors((prev: FormErrors) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev: FormErrors) => ({ ...prev, image: 'Please upload a valid image file (e.g., PNG, JPEG)' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev: FormErrors) => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/cloudinary', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        setCloudinaryUrl(data.imageUrl);
        setCloudinaryPublicId(data.publicId);
        setTempImage(data.imageUrl);
        setUserProfile((prev: UserProfile) => ({
          ...prev,
          profileImage: data.imageUrl,
          publicId: data.publicId,
        }));
        setShowImageModal(true);
      } catch (error) {
        console.error('Image upload error:', error);
        setErrors((prev: FormErrors) => ({
          ...prev,
          image: error instanceof Error ? error.message : 'Failed to upload image',
        }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm() || !user?.userId) return;
    setIsLoading(true);

    try {
      const updateData: Partial<UserProfile> = {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        bio: userProfile.bio,
        profileImage: cloudinaryUrl,
        publicId: cloudinaryPublicId,
      };

      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof typeof updateData] === initialUser[key as keyof typeof initialUser]) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      console.log('Sending update data:', updateData);
      const result = await updateProfile(updateData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setIsSuccess(true);
      setTempImage(null);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors((prev) => ({
        ...prev,
        image: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async (): Promise<void> => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setErrors((prev) => ({ ...prev, image: 'Failed to sign out. Please try again.' }));
      setShowLogoutConfirm(false);
    }
  };

  const handleReset = (): void => {
    setUserProfile(initialUser);
    setBio(initialUser.bio);
    setCloudinaryUrl(initialUser.profileImage);
    setCloudinaryPublicId(initialUser.publicId || '');
    setTempImage(null);
    setErrors({ firstName: '', lastName: '', email: '', bio: '', image: '' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 font-sans antialiased">
        <div className="flex min-h-screen">
          <div className="flex w-full lg:w-1/2 items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg rounded-2xl shadow-xl p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md sm:p-8 space-y-5">
              <div className="mb-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex flex-col items-center space-y-3">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
                <Skeleton className="h-10 w-full sm:w-1/2" />
                <Skeleton className="h-10 w-full sm:w-1/2" />
              </div>
              <div className="mt-6 text-center">
                <Skeleton className="h-10 w-full max-w-xs" />
              </div>
            </div>
          </div>
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
            <div className="flex items-center justify-center w-full relative z-10">
              <div className="max-w-md text-center px-6 py-8 space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto bg-white/10" />
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-2 bg-white/10" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-2 bg-white/10" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-2 bg-white/10" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
        <div className="p-4 bg-red-100/80 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg text-center">
          <p className="text-sm text-red-700 dark:text-red-300">{authError}</p>
          <Link
            href="/login"
            className="mt-2 inline-block text-sm font-medium text-blue-500 dark:text-blue-400 hover:underline"
            aria-label="Go to login page"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 font-sans antialiased">
      <div className="flex min-h-screen">
        <div className="flex w-full lg:w-1/2 items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg rounded-2xl shadow-xl p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md sm:p-8">
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                aria-label="Back to Home"
              >
                <svg className="w-4 h-4 mr-2 transform hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Your Profile</h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">Update your personal information</p>
            </div>

            {isSuccess && (
              <div className="mb-4 p-3 bg-green-100/80 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg flex items-center backdrop-blur-sm" role="alert">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-green-700 dark:text-green-300">Profile updated successfully!</p>
              </div>
            )}

            {errors.image && (
              <div className="mb-4 p-3 bg-red-100/80 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg flex items-center backdrop-blur-sm" role="alert">
                <p className="text-sm text-red-700 dark:text-red-300">{errors.image}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5" htmlFor="profileImage">
                  Profile Image
                </label>
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-md group cursor-pointer hover:shadow-lg transition-shadow duration-200">
                    <img
                      src={tempImage || userProfile.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={() => setShowImageModal(true)}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-label="Uploading image"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-osi0-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      name="profileImage"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Upload profile image"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Click to upload or preview</p>
                </div>
                {errors.image && !errors.image.includes('Failed to update') && (
                  <p className="mt-2 text-xs text-red-500 dark:text-red-400 text-center" role="alert">{errors.image}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={userProfile.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${errors.firstName ? 'border-red-400 dark:border-red-500' : ''}`}
                    placeholder="Enter your first name"
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400" id="firstName-error" role="alert">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={userProfile.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${errors.lastName ? 'border-red-400 dark:border-red-500' : ''}`}
                    placeholder="Enter your last name"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400" id="lastName-error" role="alert">{errors.lastName}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userProfile.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-400 dark:border-red-500' : ''}`}
                  placeholder="Enter your email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400" id="email-error" role="alert">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={userProfile.bio}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${errors.bio ? 'border-red-400 dark:border-red-500' : ''}`}
                  placeholder="Tell us about yourself..."
                  aria-invalid={errors.bio ? 'true' : 'false'}
                  aria-describedby={errors.bio ? 'bio-error' : undefined}
                />
                {errors.bio && <p className="mt-1 text-xs text-red-500 dark:text-red-400" id="bio-error" role="alert">{errors.bio}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{userProfile.bio.length}/500 characters</p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="relative cursor-pointer flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                  aria-label="Reset form to default values"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="relative cursor-pointer flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 dark:bg-blue-600 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                  aria-label="Save profile changes"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center cursor-pointer">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-label="Saving changes"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleLogout}
                  className="relative w-full cursor-pointer max-w-xs px-4 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-600 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>
          <div className="flex items-center justify-center w-full relative z-10">
            <div className="max-w-md text-center text-white px-6 py-8">
              <div className="mb-6">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-md hover:scale-105 transition-transform duration-200">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-2 tracking-tight">Craft Your Identity</h2>
                <p className="text-blue-100 text-sm">Personalize your profile with a modern, elegant touch.</p>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-2 backdrop-blur-sm shadow-sm group-hover:bg-white/20 transition-colors duration-200">
                    <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100 text-sm group-hover:text-white transition-colors duration-200">Upload a custom profile image</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-2 backdrop-blur-sm shadow-sm group-hover:bg-white/20 transition-colors duration-200">
                    <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100 text-sm group-hover:text-white transition-colors duration-200">Refine your personal details</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mr-2 backdrop-blur-sm shadow-sm group-hover:bg-white/20 transition-colors duration-200">
                    <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-blue-100 text-sm group-hover:text-white transition-colors duration-200">Write a unique bio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all duration-300 scale-100 backdrop-blur-md sm:p-8" role="dialog" aria-labelledby="image-preview-title">
            <h3 id="image-preview-title" className="text-lg font-medium text-gray-900 dark:text-white mb-3">Image Preview</h3>
            <img
              src={tempImage || userProfile.profileImage}
              alt="Profile preview"
              className="max-w-full max-h-64 object-contain rounded-lg mb-4 shadow-md"
            />
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
                  input?.click();
                }}
                className="relative w-full px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                aria-label="Change profile image"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="relative w-full px-4 cursor-pointer py-2 text-sm font-medium text-white bg-blue-500 dark:bg-blue-600 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                aria-label="Close image preview"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 w-full max-w-sm shadow-xl transform transition-all duration-300 scale-100 backdrop-blur-md sm:p-8" role="dialog" aria-labelledby="logout-confirm-title">
            <h3 id="logout-confirm-title" className="text-lg font-medium text-gray-900 dark:text-white mb-2">Confirm Sign Out</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Are you sure you want to sign out? Your profile changes are saved.</p>
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="relative w-full px-4 cursor-pointer py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                aria-label="Cancel logout"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="relative w-full cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-600 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                aria-label="Confirm logout"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}