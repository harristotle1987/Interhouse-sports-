
import { useState, useEffect, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

/**
 * SOVEREIGN PWA PROMPT HOOK V1.0 [cite: 2026-01-15]
 * Tactical Objective: Provide OS-aware, frictionless PWA enrollment.
 * Protocol:
 *  - 5-second immersion delay before any prompt.
 *  - Android: Captures 'beforeinstallprompt' event to trigger a native install banner.
 *  - iOS: Detects Safari (non-standalone) and displays a "White Glove" modal.
 */
export const usePWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidInstall, setShowAndroidInstall] = useState(false);
  const [showIOSInstallPrompt, setShowIOSInstallPrompt] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Set 5-second tactical delay
    timerRef.current = window.setTimeout(() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;

      if (deferredPrompt) {
        // Android: Show custom install button
        setShowAndroidInstall(true);
      } else if (isIOS && !isStandalone) {
        // iOS (in Safari): Show custom instructions modal
        setShowIOSInstallPrompt(true);
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const triggerAndroidInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // The user choice is handled by the browser, we can hide our button.
      setShowAndroidInstall(false);
    }
  };

  const closeIOSInstallPrompt = () => {
    setShowIOSInstallPrompt(false);
  };

  return { 
    showAndroidInstall, 
    triggerAndroidInstall, 
    showIOSInstallPrompt, 
    closeIOSInstallPrompt 
  };
};
