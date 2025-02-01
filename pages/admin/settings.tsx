import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { UserRole } from '@prisma/client';
import { useGlobalSession } from '../../hooks/useGlobalSession';
import { Cross2Icon, MinusCircledIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import PageTitleTooltip from '../../components/PageTitleTooltip';

type GameSettingKey = 'DAILY_REWARD_AMOUNT';

interface GameSetting {
  id: number;
  key: GameSettingKey;
  value: string;
  description: string | null;
}

interface BoostSession {
  id: number;
  startDate: string;
  endDate: string;
  active: boolean;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const { session } = useGlobalSession();
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [boostSessions, setBoostSessions] = useState<BoostSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('Boost actif ! Drop rates doublés pour les cartes non communes !');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, boostsRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/boost-sessions')
        ]);

        if (!settingsRes.ok || !boostsRes.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const [settingsData, boostsData] = await Promise.all([
          settingsRes.json(),
          boostsRes.json()
        ]);

        setSettings(settingsData);
        setBoostSessions(boostsData);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (key: GameSettingKey, value: string) => {
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

  const handleCreateBoost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (endDateTime <= startDateTime) {
        toast.error('La date de fin doit être postérieure à la date de début');
        return;
      }

      const res = await fetch('/api/boost-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          message,
        }),
      });

      if (res.ok) {
        toast.success('Session de boost créée avec succès');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setMessage('Boost actif ! Drop rates doublés pour les cartes non communes !');
        const newBoosts = await fetch('/api/boost-sessions').then(r => r.json());
        setBoostSessions(newBoosts);
      } else {
        toast.error('Erreur lors de la création de la session de boost');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session de boost:', error);
      toast.error('Erreur lors de la création de la session de boost');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBoostSession = async (id: number, active: boolean) => {
    try {
      const res = await fetch(`/api/boost-sessions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (res.ok) {
        toast.success(`Session de boost ${active ? 'activée' : 'désactivée'}`);
        const newBoosts = await fetch('/api/boost-sessions').then(r => r.json());
        setBoostSessions(newBoosts);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session de boost:', error);
      toast.error('Erreur lors de la mise à jour de la session de boost');
    }
  };

  const deleteBoostSession = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session de boost ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/boost-sessions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Session de boost supprimée');
        const newBoosts = await fetch('/api/boost-sessions').then(r => r.json());
        setBoostSessions(newBoosts);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la session de boost:', error);
      toast.error('Erreur lors de la suppression de la session de boost');
    }
  };

  const settingsList = [
    {
      key: 'DAILY_REWARD_AMOUNT' as GameSettingKey,
      label: 'Montant de la récompense quotidienne',
      description: 'Nombre de crédits reçus chaque jour',
      type: 'number',
      defaultValue: '45',
    },
  ];

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-game-accent mb-8">Accès refusé</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Paramètres du jeu</h1>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <PageTitleTooltip 
        title="Configuration"
        tooltip="Gérez les paramètres globaux du jeu, les périodes de boost et d'autres configurations avancées. Ces options sont réservées aux administrateurs."
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Paramètres généraux */}
        <div className="game-panel p-6">
          <h2 className="text-xl font-bold mb-6">Paramètres généraux</h2>
          <div className="space-y-6">
            {settingsList.map(setting => {
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
                      min={setting.type === 'number' ? 0 : undefined}
                      disabled={isSaving}
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

        {/* Gestion des boosts */}
        <div className="game-panel p-6">
          <h2 className="text-xl font-bold mb-6">Gestion des boosts</h2>
          
          {/* Formulaire de création */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Créer une nouvelle session de boost</h3>
            <form onSubmit={handleCreateBoost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date de début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="game-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Heure de début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="game-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="game-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Heure de fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="game-input w-full"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Message du bandeau</label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="game-input w-full"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-game-text/60 mt-1">
                    Ce message sera affiché dans le bandeau en bas de l&apos;écran pendant la période de boost
                  </p>
                </div>
              </div>
              <button
                type="submit"
                className="game-button w-full"
                disabled={isSaving}
              >
                {isSaving ? 'Création...' : 'Créer la session de boost'}
              </button>
            </form>
          </div>

          {/* Liste des sessions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sessions de boost</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boostSessions.map((boost) => {
                const isActive = boost.active;
                const now = new Date();
                const startDate = new Date(boost.startDate);
                const endDate = new Date(boost.endDate);
                const isCurrentlyRunning = isActive && startDate <= now && endDate >= now;
                const isPast = endDate < now;
                const isFuture = startDate > now;

                return (
                  <div
                    key={boost.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCurrentlyRunning ? 'border-game-success bg-game-success/10' :
                      isPast ? 'border-game-error/30 bg-game-panel-dark/50' :
                      isFuture ? 'border-game-accent/30 bg-game-panel-dark' :
                      'border-game-panel-dark bg-game-panel-dark'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isCurrentlyRunning ? 'bg-game-success animate-pulse' :
                          isPast ? 'bg-game-error' :
                          'bg-game-accent'
                        }`} />
                        <p className="font-medium text-sm truncate">
                          {startDate.toLocaleDateString()} {startDate.toLocaleTimeString().slice(0, -3)}
                          {' → '}
                          {endDate.toLocaleDateString()} {endDate.toLocaleTimeString().slice(0, -3)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleBoostSession(boost.id, !isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive ? 
                          'bg-game-error/10 text-game-error hover:bg-game-error/20' : 
                          'bg-game-success/10 text-game-success hover:bg-game-success/20'
                        }`}
                        title={isActive ? 'Désactiver' : 'Activer'}
                      >
                        {isActive ? <MinusCircledIcon className="w-4 h-4" /> : <PlusCircledIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteBoostSession(boost.id)}
                        className="p-1.5 rounded-lg bg-game-error/10 text-game-error hover:bg-game-error/20 transition-colors"
                        title="Supprimer"
                      >
                        <Cross2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {boostSessions.length === 0 && (
                <p className="text-center text-game-text-light col-span-2">
                  Aucune session de boost n&apos;a été créée
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 