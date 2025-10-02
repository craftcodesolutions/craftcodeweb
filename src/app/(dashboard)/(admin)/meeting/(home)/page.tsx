'use client';

import MeetingTypeList from '../_components/MeetingTypeList';
import RealTimeClock from '../_components/RealTimeClock';
import MobileNavigation from '../_components/MobileNavigation';
import NextMeetingBadge from '../_components/NextMeetingBadge';

const Home = () => {
  return (
    <section className="flex size-full flex-col gap-4 sm:gap-6 text-white dark:text-white px-2 sm:px-0">
      {/* Mobile Navigation - Only visible on small devices */}
      <MobileNavigation />
      
      {/* Enhanced Hero Section */}
      <div className="relative h-[200px] sm:h-[240px] lg:h-[280px] w-full rounded-xl sm:rounded-2xl bg-hero bg-cover overflow-hidden">
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/40 to-transparent dark:from-blue-900/60 dark:via-purple-900/50"></div>
        
        {/* Enhanced Animated Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-tr from-purple-500/15 to-blue-500/15 dark:from-purple-400/20 dark:to-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-400/15 dark:to-blue-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative flex h-full flex-col justify-between p-4 sm:p-6 lg:p-8">
          {/* Real Upcoming Meeting Badge */}
          <NextMeetingBadge />
          
          {/* Real-Time Clock Display */}
          <RealTimeClock />
        </div>
      </div>

      {/* Enhanced Meeting Actions */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-gray-300 dark:from-gray-100 dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
              Start Your Meeting
            </h2>
            <p className="text-gray-400 dark:text-gray-300 mt-2 text-sm sm:text-base">Choose how you&apos;d like to connect with others</p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800/40 to-slate-700/40 dark:from-slate-900/60 dark:to-slate-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-3 border border-white/10 dark:border-white/20 shadow-lg">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 dark:bg-green-400 rounded-full animate-ping opacity-30"></div>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-sm font-semibold text-white dark:text-gray-100 block">System Status</span>
                <span className="text-xs text-green-400 dark:text-green-300">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8">
          <MeetingTypeList />
        </div>
      </div>
    </section>
  );
};

export default Home;