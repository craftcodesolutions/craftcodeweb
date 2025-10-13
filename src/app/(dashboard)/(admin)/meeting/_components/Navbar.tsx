'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';


const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

 


  const getPageTitle = () => {
    if (!pathname) return 'YOOM Meeting'; // fallback
  
    if (pathname.includes('/upcoming')) return 'Upcoming Meetings';
    if (pathname.includes('/previous')) return 'Previous Meetings';
    if (pathname.includes('/personal-room')) return 'Personal Room';
    if (pathname === '/meeting') return 'Meeting Hub';
    return 'YOOM Meeting';
  };
  

  return (
    <nav className="flex items-center justify-between w-full bg-dark-1/95 backdrop-blur-xl border-b border-dark-3/20 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-4 shadow-2xl z-30">
      {/* Left Side - Logo & Platform Info */}
      <div className="hidden md:flex items-center gap-3 min-w-0 flex-shrink-0 mr-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group">
          <div className="relative">
            <Image
              src="/icons/logo.svg"
              width={32}
              height={32}
              alt="yoom logo"
              className="lg:w-9 lg:h-9 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div className="hidden lg:flex flex-col">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Meeting Platform</p>
            <p className="text-xs text-gray-500 -mt-0.5">Professional</p>
          </div>
        </Link>
      </div>
      
      {/* Center - Brand Name & Page Title */}
      <div className="flex flex-col items-center min-w-0 flex-1 mx-4 md:mx-6">
        <div className="flex items-center gap-2 md:gap-3 mb-1">
          <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
            YOOM
          </p>
          <div className="hidden md:block w-px h-5 lg:h-7 bg-gradient-to-b from-blue-500/60 to-purple-500/60 mx-1"></div>
          <p className="text-sm md:text-base font-semibold text-gray-300 hidden md:block truncate">{getPageTitle()}</p>
        </div>
        {/* Mobile Page Title */}
        <p className="text-xs text-gray-400 md:hidden truncate max-w-full font-medium">{getPageTitle()}</p>
      </div>
      
      {/* Right Side - User Actions */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink-0 ml-6">
        {isAuthenticated && user && (
          <>
            {/* Notifications */}
            <button className="relative p-2 md:p-2.5 rounded-xl bg-dark-3/30 hover:bg-dark-3/50 transition-all duration-300 group hidden lg:flex items-center justify-center">
              <Bell size={18} className="md:w-5 md:h-5 text-gray-400 group-hover:text-white transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
            </button>

            {/* User Info - Desktop Only */}
            <div className="hidden xl:flex flex-col items-end mr-2">
              <p className="text-sm font-semibold text-white truncate max-w-[140px] leading-tight">
                {user.firstName || user.email?.split('@')[0]}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <p className="text-xs text-gray-400 font-medium">Online</p>
              </div>
            </div>
            
            {/* User Avatar */}
            <div className="relative">
              <div className="flex items-center p-1 rounded-xl">
                <div className="relative">
                  {user.profileImage ? (
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-blue-500/30 transition-all duration-300 shadow-lg">
                      <Image
                        src={user.profileImage}
                        alt={`${user.firstName || user.email?.split('@')[0] || 'User'}'s profile`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <span class="text-white font-bold text-sm md:text-base">
                                  ${user.firstName?.charAt(0)?.toUpperCase() || 
                                    user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                            `;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-blue-500/30 transition-all duration-300 shadow-lg">
                      <span className="text-white font-bold text-sm md:text-base">
                        {user.firstName?.charAt(0)?.toUpperCase() || 
                         user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-1 shadow-sm"></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;