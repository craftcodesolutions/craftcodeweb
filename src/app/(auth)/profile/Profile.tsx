/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
// import ModeToggle from "@/components/ModeToggle";

export default function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Software developer passionate about creating amazing user experiences.',
    image: null as File | null
  });
  const [initialData, setInitialData] = useState(formData);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    image: ''
  });
  const [unsaved, setUnsaved] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Detect unsaved changes
  useEffect(() => {
    setUnsaved(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  // Warn on page unload if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsaved]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Drag and drop image upload
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
      return;
    }
    setFormData(prev => ({ ...prev, image: file }));
    setErrors(prev => ({ ...prev, image: '' }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  const handleImageClick = () => fileInputRef.current?.click();

  const validateForm = () => {
    const newErrors = { firstName: '', lastName: '', email: '', bio: '', image: '' };
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    else if (formData.firstName.trim().length < 2) newErrors.firstName = 'First name must be at least 2 characters';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (formData.lastName.trim().length < 2) newErrors.lastName = 'Last name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (formData.bio.length > 500) newErrors.bio = 'Bio must be less than 500 characters';
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      setIsSuccess(true);
      setShowSuccessAnimation(true);
      setInitialData(formData);
      setUnsaved(false);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
    } catch {
      setIsLoading(false);
      setErrors(prev => ({ ...prev, firstName: 'Something went wrong. Please try again.' }));
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setImagePreview(initialData.image ? imagePreview : null);
    setErrors({ firstName: '', lastName: '', email: '', bio: '', image: '' });
    setUnsaved(false);
  };

  // Show unsaved changes warning on navigation
  useEffect(() => {
    const handleRouteChange = (e: PopStateEvent) => {
      if (unsaved) {
        e.preventDefault();
        setShowUnsavedWarning(true);
      }
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [unsaved]);

  return (
    <div className="relative p-4 sm:p-8 md:p-12 pb-2 sm:pb-2 md:pb-2 bg-white dark:bg-gray-900 z-1 min-h-screen">
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Unsaved Changes</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">You have unsaved changes. Are you sure you want to leave?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUnsavedWarning(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Cancel</button>
              <button onClick={() => { setShowUnsavedWarning(false); window.history.back(); }} className="px-4 py-2 rounded bg-red-500 text-white">Leave</button>
            </div>
          </div>
        </div>
      )}
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
              Back to Dashboard
            </Link>
          </div>
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Profile Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update your profile information and avatar.
                </p>
              </div>
              <div>
                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Profile Image */}
                    <div className="text-center">
                      <div
                        ref={dropRef}
                        tabIndex={0}
                        aria-label="Profile image upload area"
                        className={`relative inline-block outline-none ${dragActive ? 'ring-2 ring-brand-500' : ''}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(); }}
                        role="button"
                      >
                        <button
                          type="button"
                          onClick={handleImageClick}
                          aria-label="Upload profile image"
                          className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 transition-colors group focus:ring-2 focus:ring-brand-500"
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                              <title>Edit image</title>
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </div>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          aria-label="Choose profile image"
                        />
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Drag & drop or click to upload (max 5MB)
                        </div>
                        {dragActive && (
                          <div className="absolute inset-0 bg-brand-500 bg-opacity-10 border-2 border-dashed border-brand-500 rounded-full flex items-center justify-center pointer-events-none">
                            <span className="text-brand-700 dark:text-brand-300 font-semibold">Drop image here</span>
                          </div>
                        )}
                      </div>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="mt-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
                          aria-label="Remove profile image"
                        >
                          Remove Image
                        </button>
                      )}
                      {errors.image && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.image}
                        </p>
                      )}
                    </div>

                    {/* Image Preview Box */}
                    {imagePreview && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Preview</h3>
                        <div className="flex items-center space-x-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formData.image?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formData.image ? (formData.image.size / 1024 / 1024).toFixed(2) : 0} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        First Name<span className="text-error-500">*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        className={`dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 transition-colors ${
                          errors.firstName 
                            ? 'border-red-300 focus:border-red-300 dark:border-red-600 dark:focus:border-red-600' 
                            : 'border-gray-300 focus:border-brand-300'
                        }`}
                        required
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Last Name<span className="text-error-500">*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        className={`dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 transition-colors ${
                          errors.lastName 
                            ? 'border-red-300 focus:border-red-300 dark:border-red-600 dark:focus:border-red-600' 
                            : 'border-gray-300 focus:border-brand-300'
                        }`}
                        required
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Email<span className="text-error-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email address"
                        className={`dark:bg-dark-900 h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 transition-colors ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-300 dark:border-red-600 dark:focus:border-red-600' 
                            : 'border-gray-300 focus:border-brand-300'
                        }`}
                        required
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className={`dark:bg-dark-900 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 transition-colors resize-none ${
                          errors.bio 
                            ? 'border-red-300 focus:border-red-300 dark:border-red-600 dark:focus:border-red-600' 
                            : 'border-gray-300 focus:border-brand-300'
                        }`}
                        aria-invalid={!!errors.bio}
                        aria-describedby={errors.bio ? 'bio-error' : undefined}
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.bio && (
                          <p id="bio-error" className="text-sm text-red-600 dark:text-red-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.bio}
                          </p>
                        )}
                        <span className={`text-xs ${formData.bio.length > 450 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}> 
                          {formData.bio.length}/500
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading || !unsaved}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                        aria-disabled={isLoading || !unsaved}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          'Update Profile'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading || !unsaved}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 transition rounded-lg bg-gray-200 dark:bg-gray-700 shadow-theme-xs hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.98]"
                        aria-disabled={isLoading || !unsaved}
                      >
                        Reset
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
                        Profile Updated Successfully
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Your profile information has been updated successfully.
                      </p>
                      <button
                        onClick={() => {
                          setIsSuccess(false);
                          setShowSuccessAnimation(false);
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                      >
                        Make More Changes
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-5">
                  <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                    Need to change something else?{' '}
                    <Link
                      href="/login"
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                    >
                      Go to Dashboard
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-5">Your Profile</h2>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                Manage your account information and keep your profile up to date.
              </p>
              <span className="inline-block mt-2 text-brand-500 dark:text-brand-400 text-3xl">👤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 