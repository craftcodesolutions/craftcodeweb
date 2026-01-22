/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import RightSidebar from './Sidebar';
import ModeToggle from '@/components/ModeToggle';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  isAdmin?: boolean;
}

interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout?: () => Promise<void>;
}

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

function Header() {
  const authContext = useAuth();
  const { user, isAuthenticated, isLoading: authLoading, logout } = authContext || { user: null, isAuthenticated: false, isLoading: false, logout: async () => {} };
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const [isUserPanelOpen, setIsUserPanelOpen] = useState<boolean>(false);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [panelAnimation, setPanelAnimation] = useState<string>('animate-userpanel-in');
  const userPanelRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState<{ logo?: boolean; profile?: boolean }>({});

  const closeUserPanel = () => {
    setPanelAnimation('animate-userpanel-out');
    setTimeout(() => {
      setIsUserPanelOpen(false);
      setShowPanel(false);
      setPanelAnimation('animate-userpanel-in');
    }, 300);
  };

  useEffect(() => {
    if (isUserPanelOpen) {
      setShowPanel(true);
      const handleClickOutside = (event: MouseEvent) => {
        if (userPanelRef.current && !userPanelRef.current.contains(event.target as Node)) {
          closeUserPanel();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isUserPanelOpen]);

  const handleLogout = async () => {
    if (!logout) {
      toast.error('Authentication context is unavailable. Please try again later.');
      return;
    }
    try {
      await logout();
      setDropdownOpen(false);
      setIsUserPanelOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out. Please try again.');
      setDropdownOpen(false);
      setIsUserPanelOpen(false);
      router.push('/');
    }
  };

  const handleNavigation = (path: string) => {
    try {
      router.push(path);
      setDropdownOpen(false);
      closeUserPanel();
    } catch (error) {
      console.error(`Navigation error to ${path}:`, error);
      toast.error(`Failed to navigate to ${path}. Please try again.`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const getUserInitials = (): string => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  const getUserDisplayName = (): string => {
    if (!user) return 'User';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'User';
  };

  const getUserAvatar = (size: AvatarSize = 'md') => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-14 h-14 text-lg',
      xl: 'w-16 h-16 text-xl'
    };

    if (user && user.profileImage && !imageError.profile) {
      return (
      <div className={`relative ${sizeClasses[size]} rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] overflow-hidden shadow-md ring-2 ring-[#6EE7D8]/50 dark:ring-[#0FD9C3]/50 cursor-pointer`}>
          <Image
            src={user.profileImage}
            alt="Profile"
            fill
            sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, (max-width: 1024px) 56px, 64px"
            className="object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError((prev) => ({ ...prev, profile: true }))}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHsgJ0W7Y6IAAAAABJRU5ErkJggg=="
          />
          <div className="absolute inset-0 rounded-sm border border-white/30 dark:border-white/10" />
        </div>
      );
    }
    return (
      <div className={`${sizeClasses[size]} rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] flex items-center justify-center shadow-md ring-2 ring-[#6EE7D8]/50 dark:ring-[#0FD9C3]/50 font-semibold text-white cursor-pointer`}>
        {getUserInitials()}
      </div>
    );
  };

  const renderUserDropdown = () => (
    <div className="absolute right-0 mt-3 w-80 bg-gradient-to-b from-[#FFFFFF] to-[#EEF7F6] dark:from-[#0B1C2D] dark:to-[#102A3A] border border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 rounded-sm shadow-xl z-50 origin-top-right animate-dropdown overflow-hidden">
      <div className="p-6 bg-gradient-to-br from-[#EEF7F6]/80 to-[#F7FBFC]/80 dark:from-[#0B1C2D]/80 dark:to-[#102A3A]/80">
        <div className="flex items-center space-x-4">
          {getUserAvatar('lg')}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E6F1F5] truncate">
              {getUserDisplayName()}
            </h3>
            <p className="text-sm text-[#475569] dark:text-[#9FB3C8] truncate mt-1">
              {user?.email}
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-[#6EE7D8]/35 dark:bg-[#0FD9C3]/25 text-[#0F172A] dark:text-[#E6F1F5]">
                {user?.isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-[#475569] hover:text-[#1E5AA8] dark:text-[#9FB3C8] dark:hover:text-[#6EE7D8] transition-colors p-2 rounded-sm hover:bg-[#DCEEEE]/60 dark:hover:bg-[#1E3A4A]/50 cursor-pointer"
            onClick={() => setDropdownOpen(false)}
            onKeyDown={(e) => handleKeyDown(e, () => setDropdownOpen(false))}
            aria-label="Close dropdown"
            role="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-3 py-3 space-y-1">
        {user?.isAdmin && (
          <button
            onClick={() => handleNavigation('/dashboard')}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/admin'))}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
            aria-label="Navigate to Admin Dashboard"
            role="button"
          >
            <div className="p-2 rounded-sm bg-[#6EE7D8]/30 dark:bg-[#0FD9C3]/25 text-[#1E5AA8] dark:text-[#6EE7D8]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span>Admin Dashboard</span>
          </button>
        )}
        <button
          onClick={() => handleNavigation('/profile')}
          onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/profile'))}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
          aria-label="Navigate to My Profile"
          role="button"
        >
          <div className="p-2 rounded-sm bg-[#EEF7F6]/70 dark:bg-[#0B1C2D]/60 text-[#475569] dark:text-[#9FB3C8]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span>My Profile</span>
        </button>
        <button
          onClick={() => handleNavigation('/account-settings')}
          onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/settings'))}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
          aria-label="Navigate to Account Settings"
          role="button"
        >
          <div className="p-2 rounded-sm bg-[#EEF7F6]/70 dark:bg-[#0B1C2D]/60 text-[#475569] dark:text-[#9FB3C8]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span>Account Settings</span>
        </button>
      </div>

      <div className="px-3 py-3 border-t border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60">
        <button
          onClick={handleLogout}
          onKeyDown={(e) => handleKeyDown(e, handleLogout)}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-100/30 dark:hover:bg-red-900/30 rounded-sm transition-all duration-200 cursor-pointer"
          aria-label="Sign out"
          role="button"
        >
          <div className="p-2 rounded-sm bg-red-100/30 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
            </svg>
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const renderMobileUserPanel = () => (
    <div
      ref={userPanelRef}
      className={`fixed top-[60px] right-0 w-full sm:w-80 bg-gradient-to-b from-[#FFFFFF] to-[#EEF7F6] dark:from-[#0B1C2D] dark:to-[#102A3A] border border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 rounded-sm shadow-xl z-50 transition-transform duration-300 ease-in-out ${panelAnimation} overflow-hidden`}
    >
      {user ? (
        <>
          <div className="p-6 bg-gradient-to-br from-[#EEF7F6]/80 to-[#F7FBFC]/80 dark:from-[#0B1C2D]/80 dark:to-[#102A3A]/80">
            <div className="flex items-center space-x-4">
              {getUserAvatar('lg')}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E6F1F5] truncate">
                  {getUserDisplayName()}
                </h3>
                <p className="text-sm text-[#475569] dark:text-[#9FB3C8] truncate mt-1">
                  {user.email || 'No email provided'}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium bg-[#6EE7D8]/35 dark:bg-[#0FD9C3]/25 text-[#0F172A] dark:text-[#E6F1F5]">
                    {user.isAdmin ? 'Admin' : 'Member'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="text-[#475569] hover:text-[#1E5AA8] dark:text-[#9FB3C8] dark:hover:text-[#6EE7D8] transition-colors p-2 rounded-sm hover:bg-[#DCEEEE]/60 dark:hover:bg-[#1E3A4A]/50 cursor-pointer"
                onClick={closeUserPanel}
                onKeyDown={(e) => handleKeyDown(e, closeUserPanel)}
                aria-label="Close user panel"
                role="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="px-3 py-3 space-y-1">
            {user.isAdmin && (
              <button
                onClick={() => handleNavigation('/dashboard')}
                onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/dashboard'))}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
                aria-label="Navigate to Admin Dashboard"
                role="button"
              >
                <div className="p-2 rounded-sm bg-[#6EE7D8]/30 dark:bg-[#0FD9C3]/25 text-[#1E5AA8] dark:text-[#6EE7D8]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>Admin Dashboard</span>
              </button>
            )}
            <button
              onClick={() => handleNavigation('/profile')}
              onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/profile'))}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
              aria-label="Navigate to My Profile"
              role="button"
            >
              <div className="p-2 rounded-sm bg-[#EEF7F6]/70 dark:bg-[#0B1C2D]/60 text-[#475569] dark:text-[#9FB3C8]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span>My Profile</span>
            </button>
            <button
              onClick={() => handleNavigation('/account-settings')}
              onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/account-settings'))}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
              aria-label="Navigate to Account Settings"
              role="button"
            >
              <div className="p-2 rounded-sm bg-[#EEF7F6]/70 dark:bg-[#0B1C2D]/60 text-[#475569] dark:text-[#9FB3C8]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span>Account Settings</span>
            </button>
          </div>
          <div className="px-3 py-3 border-t border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60">
            <button
              onClick={handleLogout}
              onKeyDown={(e) => handleKeyDown(e, handleLogout)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-100/30 dark:hover:bg-red-900/30 rounded-sm transition-all duration-200 cursor-pointer"
              aria-label="Sign out"
              role="button"
            >
              <div className="p-2 rounded-sm bg-red-100/30 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
                </svg>
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        </>
      ) : (
        <div className="p-6 flex flex-col items-center space-y-6">
          <div className="w-16 h-16 rounded-sm bg-gradient-to-br from-[#6EE7D8]/80 via-[#2FD1C5]/80 to-[#1E5AA8]/80 dark:from-[#0FD9C3]/80 dark:via-[#0B8ED8]/80 dark:to-[#0A2A66]/80 flex items-center justify-center shadow-md ring-2 ring-[#6EE7D8]/50 dark:ring-[#0FD9C3]/50">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E6F1F5]">Welcome Guest</h3>
            <p className="text-sm text-[#475569] dark:text-[#9FB3C8] mt-1">Please sign in to access your account</p>
          </div>
          <div className="w-full space-y-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] bg-[#EEF7F6] dark:bg-[#0B1C2D]/70 hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] rounded-sm transition-all duration-200 cursor-pointer"
              onClick={closeUserPanel}
              aria-label="Sign in"
            >
              <div className="p-2 rounded-sm bg-[#6EE7D8]/30 dark:bg-[#0FD9C3]/25 text-[#1E5AA8] dark:text-[#6EE7D8]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg text-[#0F172A] dark:text-[#E6F1F5] border-b border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 shadow-sm transition-all duration-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-sm" />
            <Skeleton className="h-6 w-24" />
          </div>
          <nav className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2">
              {Array(6).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-5 w-16 rounded-sm" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-sm" />
              <Skeleton className="w-9 h-9 rounded-sm" />
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg text-[#0F172A] dark:text-[#E6F1F5] border-b border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 shadow-sm transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F7FBFC] via-[#EEF7F6] to-[#F7FBFC] dark:from-[#050B14] dark:via-[#0B1C2D] dark:to-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,231,216,0.35),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(30,90,168,0.25),transparent_55%)]"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2FD1C5]/60 to-transparent"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer" aria-label="Homepage">
            <div className="relative w-10 h-10 rounded-sm flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#FFFFFF] via-[#F7FBFC] to-[#EEF7F6] dark:from-[#102A3A] dark:via-[#0B1C2D] dark:to-[#122745]">
              {imageError.logo ? (
                <span className="text-white font-semibold">CC</span>
              ) : (
                <Image
                  src="/logo.PNG"
                  alt="CraftCode Logo"
                  width={44}
                  height={44}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                  priority
                  onError={() => setImageError((prev) => ({ ...prev, logo: true }))}
                />
              )}
            </div>
            <span className="flex flex-col text-base font-bold text-[#0F172A] dark:text-[#E6F1F5] font-sans tracking-tight group-hover:text-[#1E5AA8] dark:group-hover:text-[#6EE7D8] transition-colors duration-300">
              <span className="text-base">CraftCode</span>
              <span className="-mt-1 text-sm font-cursive text-[#1E5AA8] dark:text-[#6EE7D8]" style={{ fontFamily: 'Pacifico, cursive' }}>Solutions</span>
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            {[
              { href: '/', label: 'Home' },
              { href: '/team', label: 'Team' },
              { href: '/projects', label: 'Projects' },
              { href: '/conferance', label: 'Conferance' },
              { href: '/blog', label: 'Insights' },
              { href: '/faqs', label: 'FAQs' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-sm text-sm font-medium transition-all duration-300 group cursor-pointer
                  ${
                    pathname === href
                      ? 'text-[#2FD1C5] dark:text-[#6EE7D8]'
                      : 'text-[#475569] dark:text-[#9FB3C8] hover:text-[#2FD1C5] dark:hover:text-[#6EE7D8]'
                  }`}
                aria-label={`Navigate to ${label}`}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
                <span
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] transition-all duration-300
                    ${pathname === href ? 'w-full' : 'w-0 group-hover:w-full'}`}
                ></span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <div className="hidden lg:flex items-center">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className="group flex items-center justify-center w-10 h-10 rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] text-white font-medium shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none cursor-pointer"
                    onClick={() => setDropdownOpen((open) => !open)}
                    onKeyDown={(e) => handleKeyDown(e, () => setDropdownOpen((open) => !open))}
                    aria-label="Toggle user menu"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    role="button"
                  >
                    {getUserAvatar('md')}
                  </button>
                  {dropdownOpen && renderUserDropdown()}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center w-10 h-10 rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  aria-label="Sign in"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="flex lg:hidden items-center gap-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="flex items-center justify-center w-9 h-9 rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setIsUserPanelOpen((open) => !open)}
                  onKeyDown={(e) => handleKeyDown(e, () => setIsUserPanelOpen((open) => !open))}
                  aria-label="Toggle user menu"
                  role="button"
                >
                  {getUserAvatar('sm')}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center w-9 h-9 rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  aria-label="Sign in"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
              <RightSidebar />
            </div>
          </div>
        </nav>
        {showPanel && renderMobileUserPanel()}
      </div>
      <style jsx>{`
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes userpanel-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes userpanel-out {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        .animate-dropdown {
          animation: dropdown 0.25s ease-out forwards;
        }
        .animate-userpanel-in {
          animation: userpanel-in 0.3s ease-out forwards;
        }
        .animate-userpanel-out {
          animation: userpanel-out 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  );
}

export default Header;
