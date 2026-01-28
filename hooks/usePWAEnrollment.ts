import { useState, useEffect } from 'react';

export const usePWAEnrollment = () => {
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const enrolled = localStorage.getItem('sovereign_pwa_enrolled') === 'true';
    setIsEnrolled(enrolled);
  }, []);

  const enroll = () => {
    localStorage.setItem('sovereign_pwa_enrolled', 'true');
    setIsEnrolled(true);
  };

  return { isEnrolled, enroll };
};