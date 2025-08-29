"use client";

import Link from 'next/link';
import { FC, FormEvent, useState, useEffect } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  rating: number;
  termsAccepted: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  rating?: string;
  termsAccepted?: string;
  apiError?: string;
}

const SupportSection: FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    rating: 3,
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }));
    setErrors((prev) => ({ ...prev, termsAccepted: '' }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
    validateField('rating', rating);
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
        });
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
    apiError: 'Submission',
  };

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
                      className={`p-2 sm:p-3 md:p-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:scale-105 ${
                        formData.rating === rating 
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
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 cursor-pointer text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
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