/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from 'next/link';
import { FC, FormEvent, useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  rankAndPosition?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  rating: number;
  termsAccepted: boolean;
  image: string | null;
  publicId: string | null;
  userType: string;
  userId: string | null;
  rankAndPosition: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  rating?: string;
  termsAccepted?: string;
  image?: string;
  userType?: string;
  userId?: string;
  rankAndPosition?: string;
  apiError?: string;
}

const SupportSection: FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth() as AuthContextType;
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    rating: 3,
    termsAccepted: false,
    image: null,
    publicId: null,
    userType: 'General',
    userId: null,
    rankAndPosition: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFetchingUserData, setIsFetchingUserData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormData, setShowFormData] = useState(false); // New state to toggle form data display

  // Fetch user data when userType is Client and user is authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && user?.userId && formData.userType === 'Client' && !isFetchingUserData) {
        setIsFetchingUserData(true);
        try {
          const response = await fetch(`/api/users/${user.userId}`);
          if (response.ok) {
            const userData = await response.json();
            setFormData((prev) => ({
              ...prev,
              name: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : prev.name,
              email: userData.email || prev.email,
              userId: user.userId,
              rankAndPosition: userData.rankAndPosition || prev.rankAndPosition,
            }));
          } else {
            setErrors((prev) => ({ ...prev, apiError: 'Failed to fetch user data' }));
          }
        } catch (error) {
          setErrors((prev) => ({ ...prev, apiError: 'Error fetching user data' }));
          console.error('Fetch user data error:', error);
        } finally {
          setIsFetchingUserData(false);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, user, formData.userType]);

  // Clear errors after 2 seconds
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Update userId when userType or user changes
  useEffect(() => {
    if (formData.userType === 'Client') {
      setFormData((prev) => ({ ...prev, userId: user?.userId || null }));
    } else {
      setFormData((prev) => ({ ...prev, userId: null, rankAndPosition: '' }));
    }
  }, [formData.userType, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleUserTypeChange = (selectedType: 'General' | 'Client') => {
    setFormData((prev) => ({
      ...prev,
      userType: selectedType,
      userId: selectedType === 'Client' ? user?.userId || null : null,
      rankAndPosition: selectedType === 'Client' ? prev.rankAndPosition : '',
    }));
    setShowFormData(selectedType === 'Client'); // Show form data when Client is selected
    validateField('userType', selectedType);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }));
    setErrors((prev) => ({ ...prev, termsAccepted: '' }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
    validateField('rating', rating);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await handleImageUpload(files);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    await handleImageUpload(files);
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) {
      setErrors((prev) => ({ ...prev, image: 'No file selected' }));
      return;
    }
    if (files.length > 1) {
      setErrors((prev) => ({ ...prev, image: 'Only one image is allowed' }));
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please upload a valid image file (e.g., PNG, JPEG)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/auth/cloudinary_support_image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      const reader = new FileReader();
      reader.onload = () => {
        const previewUrl = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          image: data.imageUrl,
          publicId: data.publicId,
        }));
        setImagePreview(previewUrl);
      };
      reader.onerror = () => {
        setErrors((prev) => ({ ...prev, image: 'Failed to generate image preview' }));
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, image: error.message || 'Failed to upload image' }));
      console.error('Image upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null, publicId: null }));
    setImagePreview(null);
  };

  const triggerFileInput = () => {
    const input = document.getElementById('supportImage') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const validateField = (name: string, value: string | number | boolean) => {
    const newErrors: FormErrors = { ...errors };

    if (name === 'name') {
      if (!value) newErrors.name = 'Name is required';
      else if ((value as string).length > 100) newErrors.name = 'Name must be less than 100 characters';
      else delete newErrors.name;
    }

    if (name === 'email') {
      if (!value) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(value as string)) newErrors.email = 'Invalid email format';
      else if ((value as string).length > 100) newErrors.email = 'Email must be less than 100 characters';
      else delete newErrors.email;
    }

    if (name === 'subject') {
      if (!value) newErrors.subject = 'Subject is required';
      else if ((value as string).length > 200) newErrors.subject = 'Subject must be less than 200 characters';
      else delete newErrors.subject;
    }

    if (name === 'message') {
      if (!value) newErrors.message = 'Message is required';
      else if ((value as string).length > 5000) newErrors.message = 'Message must be less than 5000 characters';
      else delete newErrors.message;
    }

    if (name === 'rating') {
      const ratingValue = Number(value);
      if (isNaN(ratingValue)) newErrors.rating = 'Rating must be a number';
      else if (!Number.isInteger(ratingValue)) newErrors.rating = 'Rating must be a whole number';
      else if (ratingValue < 1 || ratingValue > 5) newErrors.rating = 'Rating must be between 1 and 5';
      else delete newErrors.rating;
    }

    if (name === 'userType') {
      if (!['General', 'Client'].includes(value as string)) newErrors.userType = 'Please select a user type';
      else delete newErrors.userType;
    }

    if (name === 'rankAndPosition') {
      if (formData.userType === 'Client' && !value) newErrors.rankAndPosition = 'Rank and company position is required';
      else if ((value as string).length > 100) newErrors.rankAndPosition = 'Rank and company position must be less than 100 characters';
      else delete newErrors.rankAndPosition;
    }

    setErrors(newErrors);
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.rating < 1 || formData.rating > 5) newErrors.rating = 'Rating must be between 1 and 5';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
    if (!['General', 'Client'].includes(formData.userType)) newErrors.userType = 'Please select a user type';
    if (formData.userType === 'Client' && (!isAuthenticated || !formData.userId)) {
      newErrors.userId = 'You must be authenticated with a valid User ID to submit as a client';
    }
    if (formData.userType === 'Client' && !formData.rankAndPosition.trim()) {
      newErrors.rankAndPosition = 'Rank and company position is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitting(false);
        setSuccessMessage('Message sent successfully! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          rating: 3,
          termsAccepted: false,
          image: null,
          publicId: null,
          userType: 'General',
          userId: null,
          rankAndPosition: '',
        });
        setImagePreview(null);
        setShowFormData(false); // Hide form data display after successful submission
        setErrors({});
      } else {
        const { error } = await response.json();
        setErrors({ apiError: error || 'Failed to submit form' });
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrors({ apiError: 'Error submitting form' });
      console.error('Form submission error:', error);
      setIsSubmitting(false);
    }
  };

  const emailContact = 'info.codecraft.soft@gmail.com';
  const encodeEmail = (email: string) => {
    return email.replace(/./g, (char) => `&#${char.charCodeAt(0)};`);
  };
  const encodedEmail = encodeEmail(emailContact);

  // Map field names to display names for error messages
  const fieldDisplayNames: { [key: string]: string } = {
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    rating: 'Rating',
    termsAccepted: 'Terms',
    image: 'Image',
    userType: 'User Type',
    userId: 'User ID',
    rankAndPosition: 'Rank and Company Position',
    apiError: 'Submission',
  };

  if (isLoading || isFetchingUserData) {
    return (
      <section id="support">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between mb-8 md:mb-12 lg:mb-16">
            {/* Section Title Skeleton */}
            <div className="relative mx-auto mb-8 max-w-full sm:max-w-[620px] pt-6 text-center md:mb-16 lg:mb-0 lg:pt-16">
              <Skeleton className="h-10 w-40 mx-auto" />
              <Skeleton className="h-8 w-60 mx-auto mt-3" />
              <Skeleton className="h-4 w-80 mx-auto mt-2" />
            </div>
            {/* Contact Info Skeleton */}
            <div className="w-full sm:w-auto lg:w-1/3 flex justify-center lg:justify-end">
              <div className="flex items-center">
                <Skeleton className="h-1 w-12 rounded-full mr-4" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
          </div>
          <div className="max-w-full sm:max-w-3xl mx-auto">
            <div className="rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Name and Email Skeletons */}
                <div className="w-full">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="w-full">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                {/* Phone and Subject Skeletons */}
                <div className="w-full">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="w-full">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                {/* Message Skeleton */}
                <div className="sm:col-span-2 w-full">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
                {/* Image Skeleton */}
                <div className="sm:col-span-2 w-full">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-40 w-full rounded-lg" />
                </div>
                {/* User Type Checkboxes Skeleton */}
                <div className="w-full">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-5 rounded-md mr-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-5 rounded-md mr-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
                {/* Rank and Company Position Skeleton */}
                <div className="w-full">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                {/* Rating Skeleton */}
                <div className="sm:col-span-2 w-full space-y-2">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-8 w-8 rounded-lg" />
                    ))}
                    <Skeleton className="h-6 w-12 ml-2" />
                  </div>
                </div>
                {/* Terms Checkbox Skeleton */}
                <div className="sm:col-span-2 w-full">
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 rounded-md mr-3" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                {/* Submit Button Skeleton */}
                <div className="sm:col-span-2 w-full">
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(32px) scale(0.95); }
            50% { opacity: 0.7; transform: translateY(16px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
          }
        `}</style>
      </section>
    );
  }
  return (
    <section id="support">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 animate-fade-in">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between mb-8 md:mb-12 lg:mb-16">
          {/* Section Title */}
          <div
            className="relative mx-auto mb-8 max-w-full sm:max-w-[620px] pt-6 text-center md:mb-16 lg:mb-0 lg:pt-16"
            data-wow-delay=".2s"
          >
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 text-[32px] sm:text-[40px] md:text-[60px] lg:text-[95px] font-extrabold leading-none opacity-20 dark:opacity-80"
              style={{
                background: 'linear-gradient(180deg, rgba(74, 108, 247, 0.4) 0%, rgba(74, 108, 247, 0) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                ...(typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? { WebkitTextFillColor: '#f3f4f6', color: '#f3f4f6', background: 'none' } : {})
              }}
            >
              SUPPORT
            </span>
            <h2 className="font-heading text-dark mb-3 sm:mb-5 text-2xl sm:text-3xl md:text-4xl font-semibold md:text-[40px] md:leading-[48px] lg:text-[50px] lg:leading-[60px] dark:text-gray-100">
              Let&apos;s Connect
            </h2>
            <p className="text-dark-text text-sm sm:text-base">
              Have questions or need assistance? Our team is here to help you succeed.
            </p>
          </div>
          {/* Contact Info */}
          <div className="w-full sm:w-auto lg:w-1/3 relative group flex justify-center lg:justify-end">
            <div className="flex items-center justify-center lg:justify-end">
              <span className="bg-indigo-500 dark:bg-indigo-400 mr-4 h-1 w-8 sm:w-12 rounded-full transition-all duration-300 group-hover:w-16"></span>
              <Link
                href={`mailto:${emailContact}`}
                className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 break-all"
                dangerouslySetInnerHTML={{ __html: encodedEmail }}
                aria-label="Send us an email"
              />
            </div>
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs rounded-full py-1 px-3 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
              Secured Email
            </span>
          </div>
        </div>
        <div className="max-w-full sm:max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {/* Name Field */}
              <div className="w-full">
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 ${errors.name ? 'border-red-500 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:shadow-md text-sm sm:text-base`}
                  required
                  maxLength={100}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.name}: {errors.name}
                  </p>
                )}
              </div>
              {/* Email Field */}
              <div className="w-full">
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 ${errors.email ? 'border-red-500 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:shadow-md text-sm sm:text-base`}
                  required
                  maxLength={100}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.email}: {errors.email}
                  </p>
                )}
              </div>
              {/* Phone Field */}
              <div className="w-full">
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 border-gray-300 dark:border-gray-600 focus:shadow-md text-sm sm:text-base"
                  maxLength={20}
                />
              </div>
              {/* Subject Field */}
              <div className="w-full">
                <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 ${errors.subject ? 'border-red-500 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:shadow-md text-sm sm:text-base`}
                  required
                  maxLength={200}
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.subject}: {errors.subject}
                  </p>
                )}
              </div>
              {/* Rank and Company Position Field (Always Visible) */}
              <div className="sm:col-span-2 w-full">
                <label htmlFor="rankAndPosition" className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Rank and Company Position {formData.userType === 'Client' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="rankAndPosition"
                  id="rankAndPosition"
                  placeholder="e.g., Senior Developer at TechCorp"
                  value={formData.rankAndPosition}
                  onChange={handleInputChange}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 ${errors.rankAndPosition ? 'border-red-500 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:shadow-md text-sm sm:text-base`}
                  required={formData.userType === 'Client'}
                  maxLength={100}
                />
                {errors.rankAndPosition && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.rankAndPosition}: {errors.rankAndPosition}
                  </p>
                )}
              </div>
              {/* Message Field */}
              <div className="sm:col-span-2 w-full">
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  name="message"
                  id="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 resize-none ${errors.message ? 'border-red-500 ring-red-200' : 'border-gray-300 dark:border-gray-600'} focus:shadow-md text-sm sm:text-base`}
                  required
                  maxLength={5000}
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.message}: {errors.message}
                  </p>
                )}
              </div>
              {/* Image Field */}
              <div className="sm:col-span-2 w-full">
                <label htmlFor="supportImage" className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Image (Optional)
                </label>
                <div
                  className={`relative flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 ${isDragging
                      ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/50'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                    } transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploadingImage ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-6 w-6 text-indigo-500 dark:text-indigo-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        Uploading...
                      </span>
                    </div>
                  ) : imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="Support Image Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 cursor-pointer"
                        aria-label="Remove image"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Drag and drop an image here, or
                      </p>
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 cursor-pointer"
                      >
                        Browse Files
                      </button>
                      <input
                        id="supportImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                        aria-label="Upload support image"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Upload an image (max 5MB, PNG/JPEG)
                </p>
                {errors.image && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.image}: {errors.image}
                  </p>
                )}
              </div>
              {/* User Type Checkboxes */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  User Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* General User */}
                  <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${formData.userType === 'General'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                    }`}>
                    <input
                      type="radio"
                      name="userType"
                      checked={formData.userType === 'General'}
                      onChange={() => handleUserTypeChange('General')}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center mr-3 transition-all ${formData.userType === 'General'
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {formData.userType === 'General' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      General User
                    </span>
                  </label>

                  {/* Client */}
                  <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${formData.userType === 'Client'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                    }`}>
                    <input
                      type="radio"
                      name="userType"
                      checked={formData.userType === 'Client'}
                      onChange={() => handleUserTypeChange('Client')}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center mr-3 transition-all ${formData.userType === 'Client'
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300 dark:border-gray-600'
                      }`}>
                      {formData.userType === 'Client' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client
                    </span>
                  </label>
                </div>

                {errors.userType && (
                  <p className="mt-2 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.userType}: {errors.userType}
                  </p>
                )}
              </div>


              {/* Rating Field */}
              <div className="sm:col-span-2 w-full space-y-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Rate Our Support <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(rating)}
                      aria-label={`Rate ${rating} out of 5`}
                      className={`p-2 sm:p-3 md:p-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:scale-105 ${formData.rating === rating
                          ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleRatingChange(rating);
                        }
                      }}
                    >
                      <svg
                        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${rating <= formData.rating ? 'fill-indigo-600' : 'text-gray-300 dark:text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium min-w-[40px]">{formData.rating}/5</span>
                </div>
                {errors.rating && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.rating}: {errors.rating}
                  </p>
                )}
              </div>
              {/* Terms Checkbox */}
              <div className="sm:col-span-2 w-full">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    id="supportCheckbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleCheckboxChange}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center mr-3 transition-all duration-300 ${formData.termsAccepted ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}>
                    {formData.termsAccepted && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    I agree to the <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link> <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-error-in">
                    {fieldDisplayNames.termsAccepted}: {errors.termsAccepted}
                  </p>
                )}
              </div>
              {/* Submit Button, Success Message, and API Errors */}
              <div className="sm:col-span-2 w-full space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="relative w-full px-4 py-2.5 sm:py-3 rounded-md transition-all duration-300 border-amber-500 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:ring-2 hover:ring-amber-500 hover:ring-opacity-40 text-sm sm:text-base font-semibold text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="absolute -inset-2 bg-amber-200 dark:bg-amber-900/40 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />
                  {isSubmitting || isUploadingImage ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-500 dark:text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isUploadingImage ? 'Uploading Image...' : 'Sending Message...'}
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
                {successMessage && (
                  <div
                    className="mt-3 p-4 border border-green-500 bg-green-50 dark:bg-green-900/50 rounded-lg shadow-sm animate-success-in"
                    aria-live="polite"
                    role="alert"
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 dark:text-green-300 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-200">
                        {successMessage}
                      </span>
                    </div>
                  </div>
                )}
                {errors.apiError && (
                  <div
                    className="mt-3 p-4 border border-red-500 bg-red-50 dark:bg-red-900/50 rounded-lg shadow-sm animate-error-in"
                    aria-live="polite"
                    role="alert"
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-red-500 dark:text-red-300 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="text-sm text-red-600 dark:text-red-200">
                        {fieldDisplayNames.apiError}: {errors.apiError}
                      </span>
                    </div>
                  </div>
                )}
                {errors.userId && (
                  <div
                    className="mt-3 p-4 border border-red-500 bg-red-50 dark:bg-red-900/50 rounded-lg shadow-sm animate-error-in"
                    aria-live="polite"
                    role="alert"
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-red-500 dark:text-red-300 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="text-sm text-red-600 dark:text-red-200">
                        {fieldDisplayNames.userId}: {errors.userId}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
          
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(32px) scale(0.95); }
          50% { opacity: 0.7; transform: translateY(16px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes error-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-error-in {
          animation: error-in 0.3s ease-out both;
        }
        @keyframes success-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-success-in {
          animation: success-in 0.3s ease-out both;
        }
      `}</style>
    </section>
  );
};

export default SupportSection;