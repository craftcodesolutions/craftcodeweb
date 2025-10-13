'use client';

import { useState, useEffect } from 'react';
import { Video, Users, Calendar, Clock } from 'lucide-react';
import MeetingTypeList from '../_components/MeetingTypeList';
import RealTimeClock from '../_components/RealTimeClock';
import MobileNavigation from '../_components/MobileNavigation';
import NextMeetingBadge from '../_components/NextMeetingBadge';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentIcon, setCurrentIcon] = useState(0);

  const icons = [Video, Users, Calendar, Clock];

  // Simulate initial loading and icon rotation
  useEffect(() => {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Icon rotation
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 800);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(iconInterval);
    };
  }, [icons.length]);

  // Loading state component
  if (isLoading) {
    const CurrentIcon = icons[currentIcon];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="flex flex-col items-center justify-center text-center space-y-8 p-8">
          {/* Multi-layer animated icon */}
          <div className="relative">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full blur-2xl opacity-40 animate-pulse scale-150"></div>
            
            {/* Middle rotating ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-60 animate-spin scale-125" style={{ animationDuration: '3s' }}></div>
            
            {/* Inner container */}
            <div className="relative w-24 h-24 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
              <div className="relative">
                <CurrentIcon size={36} className="text-white drop-shadow-lg animate-pulse" />
                {/* Fallback spinner */}
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin opacity-50" style={{ animationDuration: '2s' }}></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced text section */}
          <div className="space-y-4 max-w-sm">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Loading Meeting Hub
            </h3>
            <p className="text-sm text-gray-400 font-medium">
              Preparing your meeting experience...
            </p>
            
            {/* Enhanced loading dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div 
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: '0s', animationDuration: '1.4s' }}
              ></div>
              <div 
                className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
              ></div>
              <div 
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
              ></div>
            </div>
            
            {/* Progress indicator */}
            <div className="w-48 h-1 bg-gray-700/50 rounded-full overflow-hidden mt-6">
              <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Background overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"></div>
      </div>
    );
  }

  // Main content with fade-in animation
  return (
    <section className="flex size-full flex-col gap-4 sm:gap-6 text-white dark:text-white animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* Mobile Navigation - Only visible on small devices */}
      <div className="lg:hidden">
        <MobileNavigation />
      </div>
      
      {/* Enhanced Hero Section - Responsive */}
      <div className="relative h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px] w-full rounded-lg sm:rounded-xl lg:rounded-2xl bg-hero bg-cover overflow-hidden animate-in fade-in duration-700 slide-in-from-top-4" style={{ animationDelay: '0.1s' }}>
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/40 to-transparent dark:from-blue-900/60 dark:via-purple-900/50"></div>
        
        {/* Enhanced Animated Background Elements - Responsive */}
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 lg:w-48 lg:h-48 bg-gradient-to-tr from-purple-500/15 to-blue-500/15 dark:from-purple-400/20 dark:to-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-400/15 dark:to-blue-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative flex h-full flex-col justify-between p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Real Upcoming Meeting Badge */}
          <NextMeetingBadge />
          
          {/* Real-Time Clock Display */}
          <RealTimeClock />
        </div>
      </div>

      {/* Enhanced Meeting Actions - Responsive */}
      <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-4" style={{ animationDelay: '0.3s' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-300 dark:from-gray-100 dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
              Start Your Meeting
            </h2>
            <p className="text-gray-400 dark:text-gray-300 mt-2 text-sm sm:text-base">Choose how you&apos;d like to connect with others</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-slate-800/40 to-slate-700/40 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 border border-white/10 dark:border-white/20 shadow-lg">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <div className="text-center lg:text-left">
                <span className="text-xs sm:text-sm font-semibold text-white dark:text-gray-100 block">System Status</span>
                <span className="text-xs text-green-400 dark:text-green-300">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-6 lg:mt-8 animate-in fade-in duration-700 slide-in-from-bottom-4" style={{ animationDelay: '0.5s' }}>
          <MeetingTypeList />
        </div>
      </div>
    </section>
  );
};

export default Home;