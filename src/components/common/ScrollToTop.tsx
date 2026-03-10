import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls to the top of the page on route change
 * This fixes the issue where scroll position is retained when navigating between pages
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Find the main scrollable container
    const mainElement = document.querySelector('main');
    
    if (mainElement) {
      // Scroll the main container to top
      mainElement.scrollTo(0, 0);
    }
    
    // Also scroll window to top as a fallback
    window.scrollTo(0, 0);
  }, [pathname]); // Trigger on pathname change

  return null; // This component doesn't render anything
}

export default ScrollToTop;
