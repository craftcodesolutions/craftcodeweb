'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const MobileNav = () => {
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
      console.error('Mobile navigation error:', error);
      // Fallback to window.location for any routing issues
      window.location.href = route;
    }
  }, [pathname, router]);

  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src="/icons/hamburger.svg"
            width={36}
            height={36}
            alt="hamburger icon"
            className="cursor-pointer sm:hidden"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-gradient-to-b from-dark-1 to-dark-2 backdrop-blur-md">
          <button 
            onClick={() => handleNavigation('/')} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <Image
                src="/icons/logo.svg"
                width={32}
                height={32}
                alt="yoom logo"
              />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-[26px] font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">YOOM</p>
          </button>
          
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <section className="flex h-full flex-col gap-3 pt-16 text-white">
                {sidebarLinks.map((item) => {
                  const isActive = pathname === item.route || 
                    (item.route !== '/meeting' && pathname?.startsWith(`${item.route}/`)) ||
                    (item.route === '/meeting' && pathname === '/meeting');

                  return (
                    <SheetClose asChild key={item.route}>
                      <button
                        key={item.label}
                        onClick={() => handleNavigation(item.route)}
                        className={cn(
                          'group flex gap-4 items-center p-4 rounded-xl w-full max-w-60 transition-all duration-300 relative overflow-hidden cursor-pointer text-left',
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
                          'relative z-10 p-2 rounded-lg transition-all duration-300',
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
                        
                        <div className="relative z-10 flex flex-col">
                          <p className={cn(
                            'font-semibold transition-all duration-300',
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
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
                        )}
                      </button>
                    </SheetClose>
                  );
                })}
              </section>
            </SheetClose>
            
            {/* Bottom decoration for mobile */}
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Meeting Hub</p>
                  <p className="text-xs text-gray-400">Mobile</p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
