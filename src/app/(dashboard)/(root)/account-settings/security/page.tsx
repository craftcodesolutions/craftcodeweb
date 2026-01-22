/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Modal from '@/components/common/Modal';

type SecuritySettings = {
  twoFactorAuth: boolean;
  passwordUpdateRequired: boolean;
  recoveryEmail: string;
  activeSessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
};

const SecuritySettingsSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6">
    <div className="h-10 w-1/3 bg-[#EEF7F6] dark:bg-[#102A3A] rounded mb-8 animate-pulse"></div>
    <div className="space-y-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border-b border-[#DCEEEE] dark:border-[#1E3A4A] pb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="h-6 w-3/4 bg-[#EEF7F6] dark:bg-[#102A3A] rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-full bg-[#EEF7F6] dark:bg-[#102A3A] rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-16 bg-[#EEF7F6] dark:bg-[#102A3A] rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
      <div className="h-32 bg-[#EEF7F6] dark:bg-[#102A3A] rounded-xl animate-pulse"></div>
    </div>
  </div>
);

const SecuritySettingsPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    passwordUpdateRequired: false,
    recoveryEmail: user?.email || '',
    activeSessions: [
      {
        id: '1',
        device: 'MacBook Pro (Chrome)',
        location: 'San Francisco, CA',
        lastActive: '2 hours ago',
        current: true,
      },
      {
        id: '2',
        device: 'iPhone 13 (Safari)',
        location: 'New York, NY',
        lastActive: '5 days ago',
        current: false,
      },
    ],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSettingChange = (setting: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleRevokeSession = (sessionId: string) => {
    setSelectedSession(sessionId);
    setShowSessionModal(true);
  };

  const confirmRevokeSession = () => {
    if (selectedSession) {
      setSecuritySettings(prev => ({
        ...prev,
        activeSessions: prev.activeSessions.filter(session => session.id !== selectedSession)
      }));
    }
    setShowSessionModal(false);
    setSelectedSession(null);
  };

  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-[#F7FBFC] via-white to-[#EEF7F6] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#102A3A]">
        <SecuritySettingsSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#F7FBFC] via-white to-[#EEF7F6] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#102A3A]">
        <div className="max-w-md p-8 text-center bg-white/80 dark:bg-[#0B1C2D] rounded-3xl shadow-xl border border-[#DCEEEE] dark:border-[#1E3A4A]">
          <h2 className="text-2xl font-bold mb-4 text-[#0F172A] dark:text-[#E6F1F5]">Access Denied</h2>
          <p className="mb-6 text-[#475569] dark:text-[#9FB3C8]">You must be logged in to view security settings.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:via-[#1FA2FF] hover:to-[#1E5AA8] text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-[#F7FBFC] via-white to-[#EEF7F6] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#102A3A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-6 bg-white/80 dark:bg-[#0B1C2D] rounded-3xl shadow-xl border border-[#DCEEEE] dark:border-[#1E3A4A]"
      >
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66]">
            Security Settings
          </h1>
          <p className="text-[#475569] dark:text-[#9FB3C8] max-w-2xl mx-auto">
            Manage your account security and active sessions
          </p>
        </div>

        <div className="space-y-8">
          {/* Two-Factor Authentication */}
          <div className="border-b border-[#DCEEEE] dark:border-[#1E3A4A] pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-1">Two-Factor Authentication</h3>
                <p className="text-sm text-[#7B8A9A] dark:text-[#6B8299]">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  securitySettings.twoFactorAuth
                    ? 'bg-[#6EE7D8]/20 text-[#0F172A] dark:bg-[#0B1C2D] dark:text-[#6EE7D8]'
                    : 'bg-[#EEF7F6] text-[#0F172A] dark:bg-[#102A3A] dark:text-[#9FB3C8]'
                }`}
              >
                {securitySettings.twoFactorAuth ? 'Enabled' : 'Enable'}
              </button>
            </div>
            {securitySettings.twoFactorAuth && (
              <div className="mt-4 p-4 bg-[#F7FBFC] dark:bg-[#0B1C2D] rounded-lg border border-[#DCEEEE] dark:border-[#1E3A4A]">
                <p className="text-sm text-[#1E5AA8] dark:text-[#6EE7D8]">
                  Two-factor authentication is currently enabled. You'll need both your password and a verification code to sign in.
                </p>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="border-b border-[#DCEEEE] dark:border-[#1E3A4A] pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-1">Password</h3>
                <p className="text-sm text-[#7B8A9A] dark:text-[#6B8299]">
                  Last changed 3 months ago
                </p>
              </div>
              <button
                onClick={() => router.push('/change-password')}
                className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] hover:from-[#2FD1C5] hover:via-[#1FA2FF] hover:to-[#1E5AA8] text-white font-medium rounded-lg transition-colors"
              >
                Change
              </button>
            </div>
            {securitySettings.passwordUpdateRequired && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your password is recommended to be updated for security reasons.
                </p>
              </div>
            )}
          </div>

          {/* Recovery Email */}
          <div className="border-b border-[#DCEEEE] dark:border-[#1E3A4A] pb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-1">Recovery Email</h3>
                <p className="text-sm text-[#7B8A9A] dark:text-[#6B8299]">
                  {securitySettings.recoveryEmail || 'No recovery email set'}
                </p>
              </div>
              <button
                onClick={() => router.push('/update-email')}
                className="px-4 py-2 bg-[#EEF7F6] cursor-pointer hover:bg-[#DCEEEE] dark:bg-[#102A3A] dark:hover:bg-[#1E3A4A] text-[#0F172A] dark:text-[#E6F1F5] font-medium rounded-lg transition-colors"
              >
                Update
              </button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="pb-6">
            <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] mb-4">Active Sessions</h3>
            <div className="space-y-4">
              {securitySettings.activeSessions.map((session) => (
                <div key={session.id} className="p-4 border border-[#DCEEEE] dark:border-[#1E3A4A] rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#0F172A] dark:text-[#E6F1F5]">{session.device}</p>
                      <p className="text-sm text-[#7B8A9A] dark:text-[#6B8299] mt-1">
                        {session.location} · {session.lastActive} {session.current && '(Current)'}
                      </p>
                    </div>
                    {!session.current && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium rounded-lg transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#DCEEEE] dark:border-[#1E3A4A]">
          <div className="bg-[#F7FBFC] dark:bg-[#0B1C2D] p-6 rounded-xl border border-[#DCEEEE] dark:border-[#1E3A4A]">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-[#1E5AA8] dark:text-[#6EE7D8] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h4 className="font-bold text-[#0F172A] dark:text-[#E6F1F5] mb-2">Security Tips</h4>
                <ul className="text-sm text-[#475569] dark:text-[#9FB3C8] list-disc pl-5 space-y-1">
                  <li>Use a strong, unique password</li>
                  <li>Enable two-factor authentication</li>
                  <li>Regularly review active sessions</li>
                  <li>Keep your recovery email up to date</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Session Revoke Modal */}
      {showSessionModal && (
        <Modal onClose={() => setShowSessionModal(false)}>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-red-600 dark:text-red-400">Revoke Session?</h3>
            <p className="mb-6 text-[#475569] dark:text-[#9FB3C8] text-lg">
              This will immediately log out the selected device. Are you sure you want to continue?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 text-lg"
                onClick={confirmRevokeSession}
              >
                Revoke Session
              </button>
              <button
                className="px-8 py-3 bg-[#EEF7F6] dark:bg-[#102A3A] hover:bg-[#DCEEEE] dark:hover:bg-[#1E3A4A] text-[#0F172A] dark:text-[#E6F1F5] font-bold rounded-xl shadow transition-all duration-300 text-lg"
                onClick={() => setShowSessionModal(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </Modal>
      )}
    </div>
  );
};

export default SecuritySettingsPage;
