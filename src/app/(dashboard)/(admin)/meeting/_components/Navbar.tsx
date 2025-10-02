'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import MobileNav from './MobileNav';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (pathname.includes('/upcoming')) return 'Upcoming Meetings';
    if (pathname.includes('/previous')) return 'Previous Meetings';
    if (pathname.includes('/personal-room')) return 'Personal Room';
    if (pathname === '/meeting') return 'Meeting Hub';
    return 'YOOM Meeting';
  };

  return (
    <nav className="flex items-center justify-between w-full bg-dark-1/95 backdrop-blur-xl border-b border-dark-3/20 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-8 shadow-2xl z-30">
      {/* Left Side - Logo (Hidden on small devices) */}
      <div className="hidden sm:flex items-center gap-2 min-w-0 flex-shrink-0">
        <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Image
              src="/icons/logo.svg"
              width={28}
              height={28}
              alt="yoom logo"
              className="sm:w-8 sm:h-8"
            />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div className="hidden md:flex flex-col">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Meeting Platform</p>
          </div>
        </Link>
      </div>
      
      {/* Center - Brand Name & Page Title */}
      <div className="flex flex-col items-center min-w-0 flex-1 mx-2 sm:mx-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p className="text-xl sm:text-xl lg:text-[24px] font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            YOOM
          </p>
          <div className="hidden sm:block w-px h-4 sm:h-6 bg-gradient-to-b from-blue-500/50 to-purple-500/50"></div>
          <p className="text-xs sm:text-sm font-medium text-gray-300 hidden sm:block truncate">{getPageTitle()}</p>
        </div>
        {/* Mobile Page Title */}
        <p className="text-xs text-gray-400 sm:hidden truncate max-w-full">{getPageTitle()}</p>
      </div>
      
      {/* Right Side - User Actions (Hidden on small devices) */}
      <div className="hidden sm:flex items-center gap-1.5 sm:gap-3 min-w-0 flex-shrink-0">
        {isAuthenticated && user && (
          <>
            {/* Notifications - Hidden on mobile */}
            <button className="relative p-2 rounded-xl bg-dark-3/30 hover:bg-dark-3/50 transition-all duration-300 group hidden md:flex">
              <Bell size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-white transition-colors" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
            </button>

            {/* User Info - Hidden on mobile and tablet */}
            <div className="hidden xl:flex flex-col items-end">
              <p className="text-sm font-medium text-white truncate max-w-[120px]">
                {user.firstName || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
            
            {/* User Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 p-1 rounded-xl hover:bg-dark-3/30 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName?.charAt(0)?.toUpperCase() || 
                       user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-dark-1"></div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-dark-2 border border-dark-3/20 rounded-xl shadow-2xl backdrop-blur-xl z-50">
                  <div className="p-3 border-b border-dark-3/20">
                    <p className="text-sm font-medium text-white truncate">
                      {user.firstName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-dark-3/30 hover:text-white transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-dark-3/30 hover:text-white transition-colors">
                      Account Settings
                    </button>
                    <div className="border-t border-dark-3/20 mt-2 pt-2">
                      <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile Navigation Toggle */}
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;