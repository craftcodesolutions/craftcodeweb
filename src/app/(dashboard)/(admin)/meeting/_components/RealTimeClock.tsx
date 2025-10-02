'use client';

import { useState, useEffect } from 'react';

const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short', 
      day: '2-digit',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Greeting */}
      <div className="text-right sm:text-left">
        <p className="text-sm sm:text-base font-medium text-blue-300 opacity-80">
          {getGreeting()}! Ready for your next meeting?
        </p>
      </div>
      
      {/* Real-time Clock */}
      <div className="relative text-right sm:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-lg transition-all duration-1000">
          {formatTime(currentTime)}
        </h1>
        
        {/* Animated seconds indicator */}
        <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2">
          <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 justify-end sm:justify-start">
        <p className="text-base sm:text-lg font-medium text-blue-200 lg:text-xl">
          {formatDate(currentTime)}
        </p>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-white">Ready to meet</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeClock;
