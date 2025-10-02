'use client';

import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'rectangle' | 'button';
  count?: number;
  animate?: boolean;
}

const SkeletonLoader = ({ 
  className, 
  variant = 'rectangle', 
  count = 1, 
  animate = true 
}: SkeletonLoaderProps) => {
  const baseClasses = cn(
    'bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded',
    animate && 'animate-pulse',
    className
  );

  const variants = {
    card: 'h-32 w-full rounded-xl',
    text: 'h-4 w-3/4 rounded',
    circle: 'h-12 w-12 rounded-full',
    rectangle: 'h-6 w-full rounded',
    button: 'h-10 w-24 rounded-lg'
  };

  const skeletonClass = cn(baseClasses, variants[variant]);

  if (count === 1) {
    return <div className={skeletonClass} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClass} />
      ))}
    </div>
  );
};

// Specific skeleton components for common use cases
export const MeetingCardSkeleton = () => (
  <div className="bg-dark-3/30 border border-white/10 rounded-2xl p-6 space-y-4">
    <div className="flex items-center justify-between">
      <SkeletonLoader variant="circle" />
      <SkeletonLoader variant="button" />
    </div>
    <SkeletonLoader variant="text" count={2} />
    <div className="flex gap-2">
      <SkeletonLoader variant="button" />
      <SkeletonLoader variant="button" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-white/10 rounded-2xl p-6 text-center space-y-3">
    <SkeletonLoader variant="circle" className="mx-auto" />
    <SkeletonLoader variant="text" className="w-16 mx-auto" />
    <SkeletonLoader variant="text" className="w-20 mx-auto" />
  </div>
);

export const NavigationSkeleton = () => (
  <div className="grid grid-cols-2 gap-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-dark-3/30 border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonLoader variant="circle" className="w-12 h-12" />
          <SkeletonLoader variant="text" className="w-12" />
        </div>
        <SkeletonLoader variant="text" />
        <SkeletonLoader variant="text" className="w-3/4" />
        <div className="w-full bg-white/10 rounded-full h-1">
          <SkeletonLoader className="h-1 w-1/3 bg-blue-500/40" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
