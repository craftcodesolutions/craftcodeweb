/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ToggleSwitch from '@/components/common/ToggleSwitch';

type PrivacySettings = {
  profileVisibility: 'public' | 'friends' | 'private';
  emailVisibility: boolean;
  activityStatus: boolean;
  dataCollection: boolean;
  personalizedAds: boolean;
};

const PrivacySettingsSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6">
    <div className="h-10 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-8 animate-pulse"></div>
    <div className="space-y-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PrivacySettingsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    emailVisibility: false,
    activityStatus: true,
    dataCollection: false,
    personalizedAds: false,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSettingChange = (setting: keyof PrivacySettings, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <PrivacySettingsSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-md p-8 text-center bg-white dark:bg-gray-950 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Access Denied</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">You must be logged in to view privacy settings.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-950 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Privacy Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Control how your information is shared and used across our platform
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Visibility */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Profile Visibility</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose who can see your profile and activity
                </p>
              </div>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Email Visibility */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Email Visibility</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Show your email address on your public profile
                </p>
              </div>
              <ToggleSwitch
                checked={privacySettings.emailVisibility}
                onChange={(checked) => handleSettingChange('emailVisibility', checked)}
              />
            </div>
          </div>

          {/* Activity Status */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Show Activity Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Let others see when you're active on the platform
                </p>
              </div>
              <ToggleSwitch
                checked={privacySettings.activityStatus}
                onChange={(checked) => handleSettingChange('activityStatus', checked)}
              />
            </div>
          </div>

          {/* Data Collection */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Data Collection</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow us to collect usage data to improve our services
                </p>
              </div>
              <ToggleSwitch
                checked={privacySettings.dataCollection}
                onChange={(checked) => handleSettingChange('dataCollection', checked)}
              />
            </div>
          </div>

          {/* Personalized Ads */}
          <div className="pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Personalized Ads</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Show ads tailored to your interests based on your activity
                </p>
              </div>
              <ToggleSwitch
                checked={privacySettings.personalizedAds}
                onChange={(checked) => handleSettingChange('personalizedAds', checked)}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Privacy Information</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We respect your privacy and are committed to protecting your personal data. 
                  Changes to these settings may take up to 24 hours to take effect across all our systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacySettingsPage;