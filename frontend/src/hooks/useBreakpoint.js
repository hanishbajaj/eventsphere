// hooks/useBreakpoint.js — Responsive breakpoint hook
import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return {
    width,
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    // Helpers
    below640:  width < 640,
    below768:  width < 768,
    below1024: width < 1024,
    below1280: width < 1280,
  };
}