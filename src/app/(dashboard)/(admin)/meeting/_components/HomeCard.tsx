'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
}

const HomeCard = ({ className, img, title, description, handleClick }: HomeCardProps) => {
  return (
    <section
      className={cn(
        'group relative bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 px-3 py-4 sm:px-4 sm:py-6 flex flex-col justify-between w-full max-w-none sm:max-w-[300px] min-h-[180px] sm:min-h-[220px] rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 dark:hover:shadow-orange-600/25 overflow-hidden',
        className
      )}
      onClick={handleClick}
    >
      {/* Background Pattern - Responsive */}
      <div className="absolute inset-0 opacity-10 dark:opacity-15">
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white dark:bg-gray-200 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white dark:bg-gray-200 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/8 dark:to-transparent group-hover:from-white/10 dark:group-hover:from-white/15 transition-all duration-300"></div>
      
      {/* Content - Responsive */}
      <div className="relative z-10">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 dark:bg-white/25 backdrop-blur-sm border border-white/30 dark:border-white/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Image 
            src={img} 
            alt="meeting" 
            width={20} 
            height={20}
            className="sm:w-6 sm:h-6 filter brightness-0 invert dark:brightness-100 dark:invert-0"
          />
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col gap-1.5 sm:gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-white dark:text-gray-100 group-hover:text-white/90 dark:group-hover:text-gray-200 transition-colors duration-300">
          {title}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-white/80 dark:text-gray-200/90 group-hover:text-white/70 dark:group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
        
        {/* Action Indicator - Responsive */}
        <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="text-xs text-white/90 dark:text-gray-200/90 font-medium">Click to start</span>
        </div>
      </div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 dark:via-white/30 to-transparent skew-x-12"></div>
    </section>
  );
};

export default HomeCard;
