import React from 'react';
import { useSovereignStore } from './store';
import Home from './Home';
import MobileApp from './MobileApp';
import CommandCenter from './CommandCenter';

const useDeviceType = () => {
  // HARDWARE LOCK [CITE: 2026-01-15]
  // Prioritize PWA standalone mode check for ultimate viewport integrity.
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const [isMobileWidth, setIsMobileWidth] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => setIsMobileWidth(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile: isPWA || isMobileWidth };
};

/**
 * SOVEREIGN ROUTER: DEVICE & ROLE ISOLATION GATE
 * This component acts as the central nervous system for the UI, directing
 * authenticated operatives to the correct interface based on their device
 * and clearance level.
 */
const SovereignRouter: React.FC = () => {
  const { user } = useSovereignStore();
  const { isMobile } = useDeviceType();

  // If no user session is active, render the public-facing Home portal.
  if (!user) {
    return <Home />;
  }

  // If the device is mobile, render the touch-optimized ObsidianMobileUI.
  if (isMobile) {
    return <MobileApp />;
  }

  // Otherwise, render the high-density desktop CommandCenter.
  return <CommandCenter />;
};

export default SovereignRouter;
