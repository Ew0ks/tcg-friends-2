import React, { useEffect, useState } from 'react';
import { useGlobalSession } from '../../hooks/useGlobalSession';
import { UserRole } from '@prisma/client';
import { toast } from 'sonner';

interface BoostSession {
  id: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BoostSessions() {
  const { session } = useGlobalSession();
  const [boostSessions, setBoostSessions] = useState<BoostSession[]>([]);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBoostSessions();
  }, []);

  const fetchBoostSessions = async () => {
    try {
      const res = await fetch('/api/boost-sessions');
      if (res.ok) {
        const data = await res.json();
        setBoostSessions(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions de boost:', error);
      toast.error('Erreur lors de la récupération des sessions de boost');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
        }),
      });

      if (res.ok) {
        toast.success('Session de boost créée avec succès');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        fetchBoostSessions();
      } else {
        toast.error('Erreur lors de la création de la session de boost');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session de boost:', error);
      toast.error('Erreur lors de la création de la session de boost');
    } finally {
      setIsLoading(false);
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
        fetchBoostSessions();
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
        fetchBoostSessions();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la session de boost:', error);
      toast.error('Erreur lors de la suppression de la session de boost');
    }
  };

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-game-accent mb-8">Accès refusé</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-game-accent mb-8">Gestion des Boosts</h1>

      <div className="game-panel p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Créer une nouvelle session de boost</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>
          <button
            type="submit"
            className="game-button w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Création...' : 'Créer la session de boost'}
          </button>
        </form>
      </div>

      <div className="game-panel p-6">
        <h2 className="text-xl font-bold mb-4">Sessions de boost</h2>
        <div className="space-y-4">
          {boostSessions.map((boost) => (
            <div
              key={boost.id}
              className="flex items-center justify-between p-4 bg-game-panel-dark rounded-lg"
            >
              <div>
                <p className="font-medium">
                  Du {new Date(boost.startDate).toLocaleString()} au{' '}
                  {new Date(boost.endDate).toLocaleString()}
                </p>
                <p className={`text-sm ${boost.active ? 'text-game-success' : 'text-game-error'}`}>
                  {boost.active ? 'Actif' : 'Inactif'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleBoostSession(boost.id, !boost.active)}
                  className={`game-button-sm ${
                    boost.active ? 'bg-game-error' : 'bg-game-success'
                  }`}
                >
                  {boost.active ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => deleteBoostSession(boost.id)}
                  className="game-button-sm bg-game-error"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {boostSessions.length === 0 && (
            <p className="text-center text-game-text-light">
              Aucune session de boost n'a été créée
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 