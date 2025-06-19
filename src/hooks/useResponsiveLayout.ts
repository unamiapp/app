'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsiveLayout(customBreakpoints?: Partial<BreakpointConfig>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');
  const [windowWidth, setWindowWidth] = useState<number>(0);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Set initial values
    setWindowWidth(window.innerWidth);
    setCurrentBreakpoint(getCurrentBreakpoint(window.innerWidth, breakpoints));
    
    // Add resize listener
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setCurrentBreakpoint(getCurrentBreakpoint(width, breakpoints));
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoints]);
  
  const isBreakpoint = (breakpoint: Breakpoint): boolean => {
    const breakpointValues = Object.entries(breakpoints)
      .sort((a, b) => a[1] - b[1])
      .map(([key]) => key as Breakpoint);
    
    const currentIndex = breakpointValues.indexOf(currentBreakpoint);
    const targetIndex = breakpointValues.indexOf(breakpoint);
    
    return currentIndex >= targetIndex;
  };
  
  return {
    currentBreakpoint,
    windowWidth,
    isXs: isBreakpoint('xs'),
    isSm: isBreakpoint('sm'),
    isMd: isBreakpoint('md'),
    isLg: isBreakpoint('lg'),
    isXl: isBreakpoint('xl'),
    is2Xl: isBreakpoint('2xl'),
    isBreakpoint,
  };
}

function getCurrentBreakpoint(width: number, breakpoints: BreakpointConfig): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}