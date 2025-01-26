import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export const useGlobalSession = () => {
  const { data: session, update } = useSession();

  const refreshSession = useCallback(async () => {
    await update();
    // Forcer un rafraîchissement de la page pour mettre à jour tous les composants
    window.location.reload();
  }, [update]);

  return {
    session,
    refreshSession
  };
}; 