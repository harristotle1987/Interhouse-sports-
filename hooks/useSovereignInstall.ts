import { useState, useEffect } from 'react';

export const useSovereignInstall = () => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);
  }, []);

  return { isInstalled };
};