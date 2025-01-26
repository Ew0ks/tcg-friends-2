import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export const useGlobalSession = () => {
  const { data: session, update } = useSession();

  const updateCredits = useCallback(async (newCredits: number) => {
    if (session) {
      await update({
        ...session,
        user: {
          ...session.user,
          credits: newCredits
        }
      });
    }
  }, [session, update]);

  return {
    session,
    updateCredits
  };
}; 