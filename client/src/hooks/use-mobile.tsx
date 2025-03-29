import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is mobile size
 * Returns true if the viewport width is less than 1024px (lg breakpoint in Tailwind)
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away to get initial state
    handleResize();
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}