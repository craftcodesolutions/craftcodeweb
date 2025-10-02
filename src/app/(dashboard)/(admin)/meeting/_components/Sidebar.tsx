'use client';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = useCallback(async (route: string) => {
    // Prevent navigation if already on the same route
    if (pathname === route) {
      return;
    }
    
    try {
      // Use router.push for smooth client-side navigation
      await router.push(route);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location for any routing issues
      window.location.href = route;
    }
  }, [pathname, router]);

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-gradient-to-b from-dark-1 to-dark-2 border-r border-dark-3/20 p-4 pt-20 text-white max-sm:hidden lg:w-[240px] shadow-xl">
      <div className="flex flex-1 flex-col gap-3">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || 
            (item.route !== '/meeting' && pathname.startsWith(`${item.route}/`)) ||
            (item.route === '/meeting' && pathname === '/meeting');
          
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.route)}
              className={cn(
                'group flex gap-3 items-center p-3 rounded-xl justify-start transition-all duration-300 relative overflow-hidden cursor-pointer w-full text-left',
                {
                  'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25': isActive,
                  'hover:bg-dark-3/50 hover:translate-x-1': !isActive,
                }
              )}
            >
              {/* Background gradient for hover effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
              
              {/* Icon container */}
              <div className={cn(
                'relative z-10 p-1.5 rounded-lg transition-all duration-300',
                {
                  'bg-white/20': isActive,
                  'bg-dark-4/50 group-hover:bg-blue-500/20': !isActive,
                }
              )}>
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  width={18}
                  height={18}
                  className={cn(
                    'transition-all duration-300',
                    {
                      'filter brightness-0 invert': isActive,
                      'group-hover:scale-110': !isActive,
                    }
                  )}
                />
              </div>
              
              <div className="relative z-10 flex flex-col max-lg:hidden">
                <p className={cn(
                  'text-base font-semibold transition-all duration-300',
                  {
                    'text-white': isActive,
                    'text-gray-300 group-hover:text-white': !isActive,
                  }
                )}>
                  {item.label}
                </p>
                {isActive && (
                  <div className="h-0.5 bg-white/30 rounded-full mt-1 animate-pulse"></div>
                )}
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Bottom decoration */}
      <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white"></div>
          </div>
          <div className="max-lg:hidden">
            <p className="text-sm font-medium text-white">Meeting Hub</p>
            <p className="text-xs text-gray-400">Professional Edition</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;
