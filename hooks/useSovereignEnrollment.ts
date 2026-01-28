import { usePWAEnrollment } from './usePWAEnrollment';
import { useSovereignInstall } from './useSovereignInstall';

export const useSovereignEnrollment = () => {
  const { isEnrolled, enroll } = usePWAEnrollment();
  const { isInstalled } = useSovereignInstall();

  return {
    shouldPrompt: !isEnrolled && !isInstalled,
    isInstalled,
    completeEnrollment: enroll
  };
};