/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDisabledAccounts } from '@/context/DisabledAccountsContext';
import { useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Modern design system
const modernGradient = 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/20';
const glassCard = 'backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50';
const modernShadow = 'shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10';
const modernRadius = 'rounded-2xl';
const modernPadding = 'p-8';
const hoverTransform = 'hover:scale-[1.02] transition-all duration-500 ease-out';
const gradientText = 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent';

const ModernPattern = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500" />
  </div>
);

const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div 
      animate={{ 
        y: [-20, 20, -20],
        rotate: [0, 180, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="absolute top-8 right-8 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60"
    />
    <motion.div 
      animate={{ 
        y: [20, -20, 20],
        rotate: [360, 180, 0],
        scale: [1.1, 1, 1.1]
      }}
      transition={{ 
        duration: 6, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay: 2
      }}
      className="absolute bottom-8 left-8 w-4 h-4 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full opacity-40"
    />
  </div>
);

const ProfileSkeleton = () => (
  <div className={`w-full lg:w-2/5 flex flex-col items-center ${modernShadow} ${glassCard} ${modernRadius} ${modernPadding} relative overflow-hidden`}>
    <div className="relative w-40 h-40 mb-6 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
    <div className="h-8 w-3/4 mb-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    <div className="h-6 w-2/3 mb-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    <div className="h-4 w-1/2 mb-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    <div className="w-full h-24 mb-6 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
    <div className="w-full pt-6 border-t border-gray-200 dark:border-gray-800">
      <div className="flex justify-between">
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const ActionsSkeleton = () => (
  <div className={`w-full lg:w-3/5 flex flex-col ${modernShadow} ${glassCard} ${modernRadius} ${modernPadding} relative overflow-hidden`}>
    <div className="h-10 w-1/2 mb-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    <div className="mb-8 p-6 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse h-24"></div>
    <div className="space-y-4">
      <div className="w-full h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      <div className="w-full h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      <div className="w-full h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      <div className="w-full h-14 mt-8 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
    </div>
  </div>
);

const AccountSettingsPage = () => {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { disableAccount } = useDisabledAccounts();
  const router = useRouter();
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDisableAccount = async () => {
    if (!user) return;
    
    setIsDisabling(true);
    
    try {
      const result = await disableAccount(user.userId, user.email, 'Account disabled by user request');
      
      if (result.success) {
        setShowDisableModal(false);
        setTimeout(() => {
          setShowThankYouModal(true);
        }, 500);
        
        // Logout the user after a short delay
        setTimeout(async () => {
          await logout();
          router.push('/login?message=Account has been disabled successfully');
        }, 3000);
      } else {
        console.error('Failed to disable account:', result.error);
        alert('Failed to disable account: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error disabling account:', error);
      alert('An error occurred while disabling your account. Please try again.');
    } finally {
      setIsDisabling(false);
    }
  };

  if (!isClient || authLoading) {
    return (
      <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${modernGradient} relative overflow-hidden`}>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="h-12 w-1/3 mx-auto bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
            <div className="h-6 w-1/2 mx-auto bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <ProfileSkeleton />
            <ActionsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/abstract-grid.svg')] bg-repeat opacity-50 dark:invert"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className={`w-full max-w-md ${glassCard} ${modernShadow} ${modernRadius} ${modernPadding} flex flex-col items-center ${hoverTransform} relative z-10`}
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-16 h-16 mb-6"
          >
            <svg className="w-full h-full text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tight">
            Account Settings
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 text-center mb-6">
            You must be logged in to view account settings.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${modernGradient} relative overflow-hidden`}>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/dotted-pattern.svg')] bg-repeat opacity-30"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-[length:200%_100%] blur-xl opacity-30 rounded-2xl"
            />
            <h1 className={`relative text-5xl md:text-6xl font-black mb-6 ${gradientText} tracking-tight`}>
              Account Settings
            </h1>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Customize your experience with advanced settings, security controls, and personalization options
          </motion.p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.section
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
            className={`w-full lg:w-2/5 flex flex-col items-center ${modernShadow} ${glassCard} ${modernRadius} ${modernPadding} ${hoverTransform} relative overflow-hidden`}
          >
            <ModernPattern />
            <FloatingElements />
            
            <div className="relative w-40 h-40 mb-6 group">
              {user.profileImage ? (
                <Image 
                  src={user.profileImage} 
                  alt="Profile" 
                  width={160} 
                  height={160} 
                  className="object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-2xl group-hover:scale-105 transition-transform duration-300 z-10 relative"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl font-extrabold text-white shadow-2xl group-hover:scale-105 transition-transform duration-300 z-10 relative">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>
            
            <div className="text-center mb-6 z-10 relative">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center justify-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <span className={gradientText}>{user.firstName} {user.lastName}</span>
              </div>
              
              <div className="text-lg text-slate-500 dark:text-slate-400 mb-6 flex items-center justify-center gap-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium">{user.email}</span>
              </div>
              
              <div className="flex justify-center gap-3 mb-6">
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${user.isAdmin ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'} animate-fadeIn transition-all duration-300`}>
                  {user.isAdmin ? 'Admin' : 'Member'}
                </span>
                <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Verified
                </span>
              </div>
            </div>
            
            {user.bio && (
              <div className="w-full mb-6 flex flex-col items-start z-10 relative">
                <span className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
                  </svg>
                  About Me
                </span>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-gray-900 dark:text-white px-5 py-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 bg-white/90 dark:bg-gray-900/90 w-full"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {user.bio}
                </motion.div>
              </div>
            )}
            
            <div className="w-full mt-auto pt-6 border-t border-gray-200 dark:border-gray-800 z-10 relative">
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last active: Recently
                </span>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 120, delay: 0.2 }}
            className={`w-full lg:w-3/5 flex flex-col ${modernShadow} ${glassCard} ${modernRadius} ${modernPadding} ${hoverTransform} relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-10 dark:opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-10 dark:opacity-20"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tight flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.96.602 2.298.115 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Account Management
              </h2>
              
              <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-800 shadow-inner">
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Security Assurance</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Your personal information is encrypted and protected with industry-standard security measures.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/profile')}
                  className="w-full py-5 cursor-pointer bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 text-lg flex items-center justify-center gap-4 group relative overflow-hidden"
                >
                  <svg className="w-6 h-6 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile Information
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/account-settings/security')}
                  className="w-full py-5 bg-gradient-to-r cursor-pointer from-purple-500 via-purple-600 to-pink-600 hover:from-purple-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 text-lg flex items-center justify-center gap-4 group relative overflow-hidden"
                >
                  <svg className="w-6 h-6 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/privacy')}
                  className="w-full py-5 bg-gradient-to-r cursor-pointer from-slate-600 via-slate-700 to-slate-800 hover:from-slate-700 hover:via-slate-800 hover:to-slate-900 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 text-lg flex items-center justify-center gap-4 group relative overflow-hidden"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Privacy Settings
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDisableModal(true)}
                  className="w-full py-5 cursor-pointer bg-gradient-to-r from-red-500 via-red-600 to-rose-600 hover:from-red-600 hover:via-red-700 hover:to-rose-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 text-lg flex items-center justify-center gap-4 group mt-8 relative overflow-hidden border border-red-400/20"
                >
                  <svg className="w-6 h-6 text-white group-hover:animate-shake" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Disable Account
                </motion.button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Modals */}
      {showDisableModal && (
        <Modal onClose={() => setShowDisableModal(false)}>
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
            <h3 className="text-2xl font-extrabold mb-4 text-red-600 dark:text-red-400">Disable Your Account?</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300 text-lg">
              This will temporarily deactivate your account. Your data will be preserved but you won't be able to access our services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleDisableAccount}
                disabled={isDisabling}
              >
                {isDisabling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Disabling...
                  </>
                ) : (
                  'Confirm Disable'
                )}
              </button>
              <button
                className="px-8 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl shadow transition-all duration-300 text-lg"
                onClick={() => setShowDisableModal(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </Modal>
      )}
      
      {showThankYouModal && (
        <Modal onClose={() => setShowThankYouModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-8 text-center"
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="w-24 h-24 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
            >
              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <h3 className="text-2xl font-extrabold mb-4 text-blue-600 dark:text-blue-400">Thank You for Being With Us!</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300 text-lg">
              We're sad to see you go but happy to have served you. Your account has been disabled. 
              If you change your mind, you can reactivate within 30 days by logging in again.
            </p>
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 text-lg"
              onClick={() => { setShowThankYouModal(false); router.push('/'); }}
            >
              Return to Homepage
            </button>
          </motion.div>
        </Modal>
      )}
    </div>
  );
};

export default AccountSettingsPage;