import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const SettingsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        const data = await response.json();
        setIsPublic(data.isPublic);
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    };

    if (session) {
      fetchSettings();
    }
  }, [session]);

  const handlePrivacyChange = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic: !isPublic
        }),
      });

      if (response.ok) {
        setIsPublic(!isPublic);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-game-accent mb-8">Paramètres</h1>

      <div className="bg-game-dark rounded-lg p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Section Confidentialité */}
          <div>
            <h2 className="text-xl font-bold text-game-accent mb-4">Confidentialité</h2>
            <div className="bg-game-light rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-game-text">Collection publique</h3>
                  <p className="text-sm text-game-muted mt-1">
                    Permettre aux autres joueurs de voir votre collection
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPublic}
                    onChange={handlePrivacyChange}
                    disabled={isSaving}
                  />
                  <div className="w-11 h-6 bg-game-dark peer-focus:outline-none rounded-full peer 
                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:bg-game-accent">
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Autres sections de paramètres à venir */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 