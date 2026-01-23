/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
  const { user, isAuthenticated, isLoading: authLoading, logout } =
    authContext || {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: async () => {},
    };

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Mobile user panel (profile sidebar)
  const [isUserPanelOpen, setIsUserPanelOpen] = useState<boolean>(false);

  const [imageError, setImageError] = useState<{ logo?: boolean; profile?: boolean }>({});
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
      setIsUserPanelOpen(false);
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
      xl: 'w-16 h-16 text-xl',
    };

    if (user && user.profileImage && !imageError.profile) {
      return (
        <div
          className={`relative ${sizeClasses[size]} rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] overflow-hidden shadow-md ring-2 ring-[#6EE7D8]/50 dark:ring-[#0FD9C3]/50`}
        >
          <Image
            src={user.profileImage}
            alt="Profile"
            fill
            sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, (max-width: 1024px) 56px, 64px"
            className="object-cover"
            onError={() => setImageError((prev) => ({ ...prev, profile: true }))}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHsgJ0W7Y6IAAAAABJRU5ErkJggg=="
          />
          <div className="absolute inset-0 rounded-sm border border-white/30 dark:border-white/10" />
        </div>
      );
    }

    return (
      <div
        className={`${sizeClasses[size]} rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] flex items-center justify-center shadow-md ring-2 ring-[#6EE7D8]/50 dark:ring-[#0FD9C3]/50 font-semibold text-white`}
      >
        {getUserInitials()}
      </div>
    );
  };

  /**
   * Dropdown positioning:
   * - Rendered in a portal (document.body) so it never creates scroll inside header.
   * - Starts after header visually.
   */
  const updateDropdownPosition = () => {
    if (!dropdownOpen) return;
    if (!anchorRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const headerRect = headerRef.current?.getBoundingClientRect();

    const headerBottom = headerRect?.bottom ?? 60;
    const right = Math.max(16, window.innerWidth - anchorRect.right);
    const top = Math.max(headerBottom + 8, anchorRect.bottom + 8);

    setDropdownPosition({ top, right });
  };

  useLayoutEffect(() => {
    if (!dropdownOpen) {
      setDropdownPosition(null);
      return;
    }

    updateDropdownPosition();

    const onResize = () => updateDropdownPosition();
    const onScroll = () => updateDropdownPosition();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current && anchorRef.current.contains(t)) return;
      if (dropdownRef.current && dropdownRef.current.contains(t)) return;
      setDropdownOpen(false);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [dropdownOpen]);

  // Close mobile panel on ESC
  useEffect(() => {
    if (!isUserPanelOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserPanelOpen(false);
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isUserPanelOpen]);

  // Prevent background scroll while the full-screen panel is open
  useEffect(() => {
    if (!isUserPanelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isUserPanelOpen]);

  const dropdownMotion = {
    initial: { opacity: 0, y: -10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.985 },
    transition: { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 },
  } as const;

  const panelOverlayMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18 },
  } as const;

  const panelMotion = {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'spring', stiffness: 380, damping: 38, mass: 0.8 },
  } as const;

  const renderUserDropdown = () => {
    if (!mounted) return null;

    const node = (
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            ref={dropdownRef}
            className="fixed w-80 bg-gradient-to-b from-[#FFFFFF] to-[#EEF7F6] dark:from-[#0B1C2D] dark:to-[#102A3A] border border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 rounded-sm shadow-xl z-[9999] origin-top-right overflow-hidden"
            style={dropdownPosition ? { top: dropdownPosition.top, right: dropdownPosition.right } : { top: 72, right: 16 }}
            {...dropdownMotion}
          >
            <div className="p-6 bg-gradient-to-br from-[#EEF7F6]/80 to-[#F7FBFC]/80 dark:from-[#0B1C2D]/80 dark:to-[#102A3A]/80">
              <div className="flex items-center space-x-4">
                {getUserAvatar('lg')}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E6F1F5] truncate">
                    {getUserDisplayName()}
                  </h3>
                  <p className="text-sm text-[#475569] dark:text-[#9FB3C8] truncate mt-1">{user?.email}</p>
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
                  onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/dashboard'))}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
                  aria-label="Navigate to Admin Dashboard"
                >
                  <div className="p-2 rounded-sm bg-[#6EE7D8]/30 dark:bg-[#0FD9C3]/25 text-[#1E5AA8] dark:text-[#6EE7D8]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
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
              >
                <div className="p-2 rounded-sm bg-[#EEF7F6]/70 dark:bg-[#0B1C2D]/60 text-[#475569] dark:text-[#9FB3C8]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span>My Profile</span>
              </button>

              <button
                onClick={() => handleNavigation('/account-settings')}
                onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/account-settings'))}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
                aria-label="Navigate to Account Settings"
              >
                <div className="p-2 rounded-sm bg-[#EEF7F6]/70 dark:bg-[#0B1C2D]/60 text-[#475569] dark:text-[#9FB3C8]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
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
              >
                <div className="p-2 rounded-sm bg-red-100/30 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );

    return createPortal(node, document.body);
  };

  /**
   * ✅ FIX "sidebar opening":
   * This is the MOBILE authenticated user panel (your profile sidebar).
   * Now it opens as a full-screen overlay (covers whole website),
   * with smooth framer-motion transitions + backdrop + no background scroll.
   */
  const renderMobileUserPanel = () => {
    if (!mounted) return null;

    const node = (
      <AnimatePresence>
        {isUserPanelOpen && (
          <motion.div className="fixed inset-0 z-[9999]" {...panelOverlayMotion}>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close user panel backdrop"
              className="absolute inset-0 bg-black/30 dark:bg-black/50 cursor-pointer"
              onClick={() => setIsUserPanelOpen(false)}
              {...panelOverlayMotion}
            />

            {/* Panel */}
            <motion.div
              className="absolute top-0 right-0 h-full w-full bg-gradient-to-b from-[#FFFFFF] to-[#EEF7F6] dark:from-[#0B1C2D] dark:to-[#102A3A] border-l border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 shadow-2xl overflow-auto"
              {...panelMotion}
            >
              {user ? (
                <>
                  {/* Header area inside panel */}
                  <div className="p-6 bg-gradient-to-br from-[#EEF7F6]/80 to-[#F7FBFC]/80 dark:from-[#0B1C2D]/80 dark:to-[#102A3A]/80 border-b border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60">
                    <div className="flex items-center space-x-4">
                      {getUserAvatar('xl')}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5] truncate">
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
                        onClick={() => setIsUserPanelOpen(false)}
                        onKeyDown={(e) => handleKeyDown(e, () => setIsUserPanelOpen(false))}
                        aria-label="Close user panel"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 space-y-2">
                    {user.isAdmin && (
                      <button
                        onClick={() => handleNavigation('/dashboard')}
                        onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/dashboard'))}
                        className="w-full flex items-center space-x-3 px-4 py-4 text-base text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
                        aria-label="Navigate to Admin Dashboard"
                      >
                        <div className="p-2 rounded-sm bg-[#6EE7D8]/30 dark:bg-[#0FD9C3]/25 text-[#1E5AA8] dark:text-[#6EE7D8]">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigation('/profile')}
                      onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/profile'))}
                      className="w-full flex items-center space-x-3 px-4 py-4 text-base text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
                      aria-label="Navigate to My Profile"
                    >
                      <div className="p-2 rounded-sm bg-[#EEF7F6]/70 dark:bg-[#0B1C2D]/60 text-[#475569] dark:text-[#9FB3C8]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => handleNavigation('/account-settings')}
                      onKeyDown={(e) => handleKeyDown(e, () => handleNavigation('/account-settings'))}
                      className="w-full flex items-center space-x-3 px-4 py-4 text-base text-[#475569] dark:text-[#9FB3C8] hover:bg-[#EEF7F6] dark:hover:bg-[#0B1C2D] rounded-sm transition-all duration-200 cursor-pointer"
                      aria-label="Navigate to Account Settings"
                    >
                      <div className="p-2 rounded-sm bg-[#EEF7F6]/70 dark:bg-[#0B1C2D]/60 text-[#475569] dark:text-[#9FB3C8]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-.426-1.756-2.924 0-1.756 0-1.756 1.756-2.182a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span>Account Settings</span>
                    </button>

                    <div className="pt-3 border-t border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60">
                      <button
                        onClick={handleLogout}
                        onKeyDown={(e) => handleKeyDown(e, handleLogout)}
                        className="w-full flex items-center space-x-3 px-4 py-4 text-base text-red-600 dark:text-red-400 hover:bg-red-100/30 dark:hover:bg-red-900/30 rounded-sm transition-all duration-200 cursor-pointer"
                        aria-label="Sign out"
                      >
                        <div className="p-2 rounded-sm bg-red-100/30 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-10 flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 rounded-sm bg-gradient-to-br from-[#6EE7D8]/80 via-[#2FD1C5]/80 to-[#1E5AA8]/80 dark:from-[#0FD9C3]/80 dark:via-[#0B8ED8]/80 dark:to-[#0A2A66]/80 flex items-center justify-center shadow-md ring-2 ring-[#6EE7D8]/50 dark:ring-[#0FD9C3]/50">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#E6F1F5]">Welcome Guest</h3>
                    <p className="text-sm text-[#475569] dark:text-[#9FB3C8] mt-1">Please sign in to access your account</p>
                  </div>
                  <Link
                    href="/login"
                    className="w-full max-w-md flex items-center justify-center space-x-3 px-4 py-3 text-sm text-[#475569] dark:text-[#9FB3C8] bg-[#EEF7F6] dark:bg-[#0B1C2D]/70 hover:bg-[#DCEEEE] dark:hover:bg-[#102A3A] rounded-sm transition-all duration-200 cursor-pointer"
                    onClick={() => setIsUserPanelOpen(false)}
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
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );

    return createPortal(node, document.body);
  };

  if (authLoading) {
    return (
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg text-[#0F172A] dark:text-[#E6F1F5] border-b border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 shadow-sm transition-all duration-500 overflow-x-hidden overflow-y-visible"
      >
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
              {Array(6)
                .fill(0)
                .map((_, index) => (
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
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg text-[#0F172A] dark:text-[#E6F1F5] border-b border-[#DCEEEE]/60 dark:border-[#1E3A4A]/60 shadow-sm transition-all duration-500 overflow-x-hidden overflow-y-visible"
      >
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
                    src="/logo.png"
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
                <span
                  className="-mt-1 text-sm font-cursive text-[#1E5AA8] dark:text-[#6EE7D8]"
                  style={{ fontFamily: 'Pacifico, cursive' }}
                >
                  Solutions
                </span>
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
                  <>
                    <button
                      ref={anchorRef}
                      type="button"
                      className="group flex items-center justify-center w-10 h-10 rounded-sm bg-gradient-to-br from-[#6EE7D8] via-[#2FD1C5] to-[#1E5AA8] dark:from-[#0FD9C3] dark:via-[#0B8ED8] dark:to-[#0A2A66] text-white font-medium shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none cursor-pointer"
                      onClick={() => setDropdownOpen((open) => !open)}
                      onKeyDown={(e) => handleKeyDown(e, () => setDropdownOpen((open) => !open))}
                      aria-label="Toggle user menu"
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen}
                    >
                      {getUserAvatar('md')}
                    </button>

                    {renderUserDropdown()}
                  </>
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
                    onClick={() => setIsUserPanelOpen(true)}
                    onKeyDown={(e) => handleKeyDown(e, () => setIsUserPanelOpen(true))}
                    aria-label="Open user panel"
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
                {/* Your existing RightSidebar (hamburger) */}
                <RightSidebar />
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Full-screen mobile user panel (portal) */}
      {renderMobileUserPanel()}
    </>
  );
}

export default Header;
