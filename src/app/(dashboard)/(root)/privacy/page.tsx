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
    <div className="h-10 w-1/3 bg-[#DCEEEE] dark:bg-[#102A3A] rounded mb-8 animate-pulse"></div>
    <div className="space-y-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-[#DCEEEE] dark:border-[#102A3A] pb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-6 w-3/4 bg-[#DCEEEE] dark:bg-[#102A3A] rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-full bg-[#DCEEEE] dark:bg-[#102A3A] rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-[#DCEEEE] dark:bg-[#102A3A] rounded-full animate-pulse"></div>
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
      <div className="min-h-screen py-12 bg-gradient-to-br from-[#F7FBFC] via-[#FFFFFF] to-[#EEF7F6] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <PrivacySettingsSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#F7FBFC] via-[#FFFFFF] to-[#EEF7F6] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="max-w-md p-8 text-center bg-white dark:bg-[#0B1C2D] rounded-3xl shadow-xl border border-[#DCEEEE] dark:border-[#102A3A]">
          <h2 className="text-2xl font-bold mb-4 text-[#0F172A] dark:text-[#E6F1F5]">Access Denied</h2>
          <p className="mb-6 text-[#475569] dark:text-[#9FB3C8]">You must be logged in to view privacy settings.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-gradient-to-r from-[#2FD1C5] to-[#1E5AA8] hover:from-[#1E5AA8] hover:to-[#0B1C2D] text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-[#F7FBFC] via-[#FFFFFF] to-[#EEF7F6] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-6 bg-white dark:bg-[#0B1C2D] rounded-3xl shadow-xl border border-[#DCEEEE] dark:border-[#102A3A]"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#1E5AA8] via-[#2FD1C5] to-[#6EE7D8] dark:from-[#6EE7D8] dark:via-[#2FD1C5] dark:to-[#1E5AA8]">
            Privacy Settings
          </h1>
          <p className="text-[#475569] dark:text-[#9FB3C8] max-w-2xl mx-auto">
            Control how your information is shared and used across our platform
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Visibility */}
          <div className="border-b border-[#DCEEEE] dark:border-[#102A3A] pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-1">Profile Visibility</h3>
                <p className="text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
                  Choose who can see your profile and activity
                </p>
              </div>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                className="px-4 py-2 bg-[#EEF7F6] dark:bg-[#102A3A] border border-[#DCEEEE] dark:border-[#102A3A] rounded-lg text-[#0F172A] dark:text-[#E6F1F5]"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Email Visibility */}
          <div className="border-b border-[#DCEEEE] dark:border-[#102A3A] pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-1">Email Visibility</h3>
                <p className="text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
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
          <div className="border-b border-[#DCEEEE] dark:border-[#102A3A] pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-1">Show Activity Status</h3>
                <p className="text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
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
          <div className="border-b border-[#DCEEEE] dark:border-[#102A3A] pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-1">Data Collection</h3>
                <p className="text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
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
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-1">Personalized Ads</h3>
                <p className="text-sm text-[#7B8A9A] dark:text-[#9FB3C8]">
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

        <div className="mt-12 pt-6 border-t border-[#DCEEEE] dark:border-[#102A3A]">
          <div className="bg-[#E6F7F6] dark:bg-[#102A3A] p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#2FD1C5] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Privacy Information</h4>
                <p className="text-sm text-[#475569] dark:text-[#9FB3C8]">
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
