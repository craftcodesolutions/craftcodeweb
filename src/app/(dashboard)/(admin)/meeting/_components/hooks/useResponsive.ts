'use client';

import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakpointKey = keyof BreakpointConfig;

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });

      // Determine current breakpoint
      let breakpoint: BreakpointKey = 'xs';
      for (const [key, value] of Object.entries(breakpoints)) {
        if (width >= value) {
          breakpoint = key as BreakpointKey;
        }
      }
      setCurrentBreakpoint(breakpoint);
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions
  const isXs = currentBreakpoint === 'xs';
  const isSm = currentBreakpoint === 'sm';
  const isMd = currentBreakpoint === 'md';
  const isLg = currentBreakpoint === 'lg';
  const isXl = currentBreakpoint === 'xl';
  const is2Xl = currentBreakpoint === '2xl';

  const isMobile = windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;

  const isSmallScreen = windowSize.width < breakpoints.sm;
  const isMediumScreen = windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.lg;
  const isLargeScreen = windowSize.width >= breakpoints.lg;

  // Responsive grid columns helper
  const getGridCols = (mobile: number, tablet: number, desktop: number) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  // Responsive spacing helper
  const getSpacing = (mobile: string, tablet: string, desktop: string) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  // Responsive text size helper
  const getTextSize = (mobile: string, tablet: string, desktop: string) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  };

  return {
    windowSize,
    currentBreakpoint,
    breakpoints,
    
    // Breakpoint checks
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    
    // Device type checks
    isMobile,
    isTablet,
    isDesktop,
    
    // Screen size checks
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    
    // Helper functions
    getGridCols,
    getSpacing,
    getTextSize,
    
    // Utility functions
    isAbove: (breakpoint: BreakpointKey) => windowSize.width >= breakpoints[breakpoint],
    isBelow: (breakpoint: BreakpointKey) => windowSize.width < breakpoints[breakpoint],
    isBetween: (min: BreakpointKey, max: BreakpointKey) => 
      windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max],
  };
};

export default useResponsive;
