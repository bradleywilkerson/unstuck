'use client';

import { useState, useEffect } from 'react';

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileSize = window.innerWidth <= 768;
      console.log({
        userAgent,
        windowWidth: window.innerWidth,
        touchPoints: navigator.maxTouchPoints,
        isTouchDevice,
        isMobileSize
      })
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || (isTouchDevice && isMobileSize);
    };

    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
} 