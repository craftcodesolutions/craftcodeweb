'use client';

import { useState, useEffect } from 'react';
import { Video, Users, Calendar, Clock, Sparkles } from 'lucide-react';

interface EnhancedLoaderProps {
  message?: string;
  submessage?: string;
  type?: 'default' | 'meeting' | 'data' | 'video';
  size?: 'sm' | 'md' | 'lg';
}

const EnhancedLoader = ({ 
  message = "Loading...", 
  submessage = "Please wait while we prepare everything for you",
  type = 'default',
  size = 'md'
}: EnhancedLoaderProps) => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const [loadingDots, setLoadingDots] = useState('');

  const icons = {
    default: [Sparkles, Video, Users, Calendar],
    meeting: [Video, Users, Calendar, Clock],
    data: [Calendar, Clock, Users, Video],
    video: [Video, Sparkles, Users, Calendar]
  };

  const iconSet = icons[type];

  // Rotate icons
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % iconSet.length);
    }, 800);

    return () => clearInterval(iconInterval);
  }, [iconSet.length]);

  // Animate loading dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setLoadingDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  const sizeClasses = {
    sm: {
      container: 'p-6',
      icon: 'w-12 h-12',
      iconSize: 24,
      title: 'text-lg',
      subtitle: 'text-sm',
      spinner: 'w-8 h-8'
    },
    md: {
      container: 'p-8',
      icon: 'w-16 h-16',
      iconSize: 32,
      title: 'text-xl',
      subtitle: 'text-base',
      spinner: 'w-10 h-10'
    },
    lg: {
      container: 'p-12',
      icon: 'w-20 h-20',
      iconSize: 40,
      title: 'text-2xl',
      subtitle: 'text-lg',
      spinner: 'w-12 h-12'
    }
  };

  const CurrentIcon = iconSet[currentIcon];
  const classes = sizeClasses[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className={`flex flex-col items-center justify-center text-center max-w-md mx-auto ${classes.container}`}>
        {/* Animated Background */}
        <div className="relative mb-6">
          {/* Outer rotating ring */}
          <div className={`absolute inset-0 ${classes.icon} border-2 border-blue-500/30 rounded-full animate-spin`} 
               style={{ animationDuration: '3s' }} />
          
          {/* Inner pulsing ring */}
          <div className={`absolute inset-2 ${classes.spinner} border-2 border-purple-500/50 rounded-full animate-pulse`} />
          
          {/* Icon container */}
          <div className={`relative ${classes.icon} bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30`}>
            <CurrentIcon 
              size={classes.iconSize} 
              className="text-white animate-pulse" 
            />
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-bounce" 
               style={{ animationDelay: '0s' }} />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-bounce" 
               style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" 
               style={{ animationDelay: '1s' }} />
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h3 className={`font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent ${classes.title}`}>
            {message}{loadingDots}
          </h3>
          <p className={`text-gray-400 ${classes.subtitle} max-w-xs`}>
            {submessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mt-6">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" 
                 style={{ 
                   width: '60%',
                   animation: 'pulse 2s ease-in-out infinite'
                 }} />
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">System Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" 
                 style={{ animationDelay: '0.5s' }} />
            <span className="text-xs text-gray-400">Connecting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoader;
