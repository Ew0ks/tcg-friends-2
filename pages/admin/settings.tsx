import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

interface GameSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des paramètres');
        }
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des paramètres');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du paramètre');
      }

      const updatedSetting = await response.json();
      setSettings(settings.map(s => s.key === key ? updatedSetting : s));
      toast.success('Paramètre mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du paramètre');
    } finally {
      setIsSaving(false);
    }
  };

  const settingsList = [
    {
      key: 'DAILY_REWARD_AMOUNT',
      label: 'Montant de la récompense quotidienne',
      description: 'Nombre de crédits reçus chaque jour',
      type: 'number',
      defaultValue: '45',
    },
    // Ajoutez d'autres paramètres ici si nécessaire
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Paramètres du jeu</h1>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Paramètres du jeu</h1>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-game-dark text-white rounded-lg hover:bg-game-dark/80 transition-colors"
        >
          Retour
        </button>
      </div>

      <div className="game-panel p-6">
        <div className="space-y-6">
          {settingsList.map((setting) => {
            const currentSetting = settings.find(s => s.key === setting.key);
            const currentValue = currentSetting?.value || setting.defaultValue;

            return (
              <div key={setting.key} className="space-y-2">
                <label className="block text-sm font-medium">
                  {setting.label}
                </label>
                <div className="flex gap-4">
                  <input
                    type={setting.type}
                    className="flex-grow px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none"
                    value={currentValue}
                    onChange={(e) => handleSave(setting.key, e.target.value)}
                    min={0}
                  />
                </div>
                {setting.description && (
                  <p className="text-sm text-game-text/60">
                    {setting.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 