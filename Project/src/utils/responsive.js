// Responsive utility functions for consistent responsive design
import { useState, useEffect } from 'react';

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const responsiveClasses = {
  // Container classes
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerFluid: 'w-full px-4 sm:px-6 lg:px-8',
  
  // Grid classes
  gridCols1: 'grid grid-cols-1',
  gridCols2: 'grid grid-cols-1 sm:grid-cols-2',
  gridCols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  gridCols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gridCols5: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  gridColsAuto: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-auto',
  
  // Gap classes
  gap2: 'gap-2 sm:gap-3 md:gap-4',
  gap3: 'gap-3 sm:gap-4 md:gap-6',
  gap4: 'gap-4 sm:gap-6 md:gap-8',
  
  // Padding classes
  p2: 'p-2 sm:p-3 md:p-4',
  p3: 'p-3 sm:p-4 md:p-6',
  p4: 'p-4 sm:p-6 md:p-8',
  px2: 'px-2 sm:px-3 md:px-4',
  px3: 'px-3 sm:px-4 md:px-6',
  py2: 'py-2 sm:py-3 md:py-4',
  py3: 'py-3 sm:py-4 md:py-6',
  
  // Text sizes
  textXs: 'text-xs sm:text-sm',
  textSm: 'text-sm sm:text-base',
  textBase: 'text-base sm:text-lg',
  textLg: 'text-lg sm:text-xl md:text-2xl',
  textXl: 'text-xl sm:text-2xl md:text-3xl',
  text2xl: 'text-2xl sm:text-3xl md:text-4xl',
  
  // Common card classes
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
  cardPadding: 'p-3 sm:p-4 md:p-6',
  cardHeader: 'flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700',
  
  // Button classes
  btnSm: 'px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm',
  btnMd: 'px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base',
  btnLg: 'px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg',
  
  // Icon sizes
  iconXs: 'h-3 w-3 sm:h-4 sm:w-4',
  iconSm: 'h-4 w-4 sm:h-5 sm:w-5',
  iconMd: 'h-5 w-5 sm:h-6 sm:w-6',
  iconLg: 'h-6 w-6 sm:h-8 sm:w-8',
  iconXl: 'h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12',
  
  // Flex classes
  flexCol: 'flex flex-col',
  flexRow: 'flex flex-col sm:flex-row',
  flexRowReverse: 'flex flex-col-reverse sm:flex-row',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  
  // Space classes
  spaceY2: 'space-y-2 sm:space-y-3',
  spaceY3: 'space-y-3 sm:space-y-4',
  spaceY4: 'space-y-4 sm:space-y-6',
  spaceX2: 'space-x-2 sm:space-x-3',
  spaceX3: 'space-x-3 sm:space-x-4',
  spaceX4: 'space-x-4 sm:space-x-6',
  
  // Responsive visibility
  hiddenSm: 'hidden sm:block',
  hiddenMd: 'hidden md:block',
  hiddenLg: 'hidden lg:block',
  smOnly: 'block sm:hidden',
  mdOnly: 'hidden sm:block lg:hidden',
  lgOnly: 'hidden lg:block xl:hidden',
};

// Utility function to combine responsive classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Media query utilities for JavaScript
export const mediaQueries = {
  isMobile: () => window.innerWidth < 640,
  isTablet: () => window.innerWidth >= 640 && window.innerWidth < 1024,
  isDesktop: () => window.innerWidth >= 1024,
  isSmall: () => window.innerWidth < 768,
  isMedium: () => window.innerWidth >= 768 && window.innerWidth < 1024,
  isLarge: () => window.innerWidth >= 1024,
};

// Hook for responsive breakpoints
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('lg');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else if (width < 1536) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
};

// Common responsive configurations
export const responsiveConfig = {
  // Dashboard grid configuration
  dashboard: {
    mainGrid: 'grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6',
    cardGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    statsGrid: 'grid grid-cols-2 sm:grid-cols-4 gap-4',
  },
  
  // Form configuration
  form: {
    container: 'max-w-md sm:max-w-lg lg:max-w-2xl mx-auto',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    input: 'w-full px-3 py-2 text-sm sm:text-base',
    button: 'w-full sm:w-auto px-4 py-2 text-sm sm:text-base',
  },
  
  // Modal configuration
  modal: {
    container: 'w-full max-w-lg sm:max-w-2xl lg:max-w-4xl',
    padding: 'p-4 sm:p-6',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
  },
  
  // Navigation configuration
  navigation: {
    sidebar: 'w-64 lg:w-72',
    mobileMenu: 'fixed inset-y-0 left-0 z-50 w-64 transform lg:translate-x-0',
    overlay: 'fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden',
  },
};

export default {
  breakpoints,
  responsiveClasses,
  cn,
  mediaQueries,
  useBreakpoint,
  responsiveConfig,
};
