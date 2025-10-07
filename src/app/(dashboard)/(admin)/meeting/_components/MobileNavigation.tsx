'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Home, Calendar, Clock, User, ChevronRight, Sparkles } from 'lucide-react';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const MobileNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleNavigation = useCallback(async (route: string) => {
    // Prevent navigation if already on the same route
    if (pathname === route) {
      return;
    }
    
    setIsAnimating(true);
    
    try {
      // Use router.push for smooth client-side navigation
      await router.push(route);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location for any routing issues
      window.location.href = route;
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [pathname, router]);

  const getIcon = (route: string) => {
    switch (route) {
      case '/meeting':
        return <Home size={20} />;
      case '/meeting/upcoming':
        return <Calendar size={20} />;
      case '/meeting/previous':
        return <Clock size={20} />;
      case '/meeting/personal-room':
        return <User size={20} />;
      default:
        return <Home size={20} />;
    }
  };

  const getDescription = (route: string) => {
    switch (route) {
      case '/meeting':
        return 'Dashboard & Controls';
      case '/meeting/upcoming':
        return 'Scheduled Meetings';
      case '/meeting/previous':
        return 'Meeting History';
      case '/meeting/personal-room':
        return 'Personal Room';
      default:
        return '';
    }
  };

  const getStats = (route: string) => {
    // Mock stats - in real app, these would come from API
    switch (route) {
      case '/meeting':
        return '4 active';
      case '/meeting/upcoming':
        return '3 today';
      case '/meeting/previous':
        return '12 total';
      case '/meeting/personal-room':
        return 'Ready';
      default:
        return '';
    }
  };

  return (
    <div className="sm:hidden mb-8">
      {/* Enhanced Mobile Navigation Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Quick Navigation
            </h3>
            <p className="text-xs text-gray-400">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-green-500/30">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-30"></div>
          </div>
          <span className="text-xs font-medium text-green-300">Online</span>
        </div>
      </div>

      {/* Enhanced Mobile Navigation Grid */}
      <div className="grid grid-cols-2 gap-4">
        {sidebarLinks.map((item, index) => {
          const isActive = pathname === item.route || 
            (item.route !== '/meeting' && pathname?.startsWith(`${item.route}/`)) ||
            (item.route === '/meeting' && pathname === '/meeting');
          
          return (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.route)}
              disabled={isAnimating}
              className={cn(
                'group flex flex-col items-start gap-3 p-5 rounded-2xl transition-all duration-300 relative overflow-hidden cursor-pointer border text-left',
                {
                  'bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 border-blue-400/50 scale-[1.02]': isActive,
                  'bg-gradient-to-br from-dark-3/40 to-dark-4/40 hover:from-dark-3/60 hover:to-dark-4/60 border-white/10 hover:border-blue-500/40 backdrop-blur-sm hover:scale-[1.01] hover:shadow-lg': !isActive,
                },
                isAnimating && 'opacity-50 cursor-not-allowed'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Enhanced background effects */}
              {!isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </>
              )}
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Top row: Icon and stats */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300',
                  {
                    'bg-white/20 shadow-lg': isActive,
                    'bg-white/5 group-hover:bg-white/10 group-hover:scale-110': !isActive,
                  }
                )}>
                  {getIcon(item.route)}
                </div>
                
                <div className={cn(
                  'px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300',
                  {
                    'bg-white/20 text-white': isActive,
                    'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-gray-300': !isActive,
                  }
                )}>
                  {getStats(item.route)}
                </div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-1">
                  <p className={cn(
                    'text-base font-bold transition-all duration-300',
                    {
                      'text-white': isActive,
                      'text-gray-200 group-hover:text-white': !isActive,
                    }
                  )}>
                    {item.label}
                  </p>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                
                <p className={cn(
                  'text-xs transition-all duration-300 mb-2',
                  {
                    'text-white/80': isActive,
                    'text-gray-400 group-hover:text-gray-300': !isActive,
                  }
                )}>
                  {getDescription(item.route)}
                </p>
                
                {/* Progress indicator */}
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div 
                    className={cn(
                      'h-1 rounded-full transition-all duration-500',
                      {
                        'bg-white/40 w-full': isActive,
                        'bg-blue-500/40 w-0 group-hover:w-1/3': !isActive,
                      }
                    )}
                  ></div>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <ChevronRight 
                size={16} 
                className={cn(
                  'absolute bottom-4 right-4 transition-all duration-300',
                  {
                    'text-white/60': isActive,
                    'text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1': !isActive,
                  }
                )} 
              />
            </button>
          );
        })}
      </div>

      {/* Enhanced Mobile Bottom Info */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm relative overflow-hidden">
        {/* Background animation */}
        <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 dark:from-slate-700/50 dark:to-slate-600/50 backdrop-blur-xl border border-white/10 dark:border-white/20 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white dark:text-gray-100">Meeting Dashboard</h2>
                <p className="text-xs text-gray-400 dark:text-gray-300">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 dark:text-green-300 font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MobileNavigation;
