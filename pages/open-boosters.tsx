import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { BoosterType } from '@prisma/client';
import CardRevealModal from '../components/CardRevealModal';

interface Booster {
  type: BoosterType;
  cost: number;
  cardCount: number;
  description: string;
}

const OpenBoosters: React.FC = () => {
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const { user, setUser } = useAuth();
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBoosters = async () => {
      try {
        console.log('Fetching boosters...'); // Debug
        const res = await fetch('/api/boosters');
        console.log('Boosters response status:', res.status); // Debug
        const data = await res.json();
        console.log('Boosters data:', data); // Debug
        setBoosters(data);
      } catch (error) {
        console.error('Error fetching boosters:', error);
      }
    };

    fetchBoosters();
  }, []);

  const handleOpenBooster = async (type: BoosterType) => {
    try {
      if (!user?.id) {
        console.log('No user found:', user);
        throw new Error('Utilisateur non connecté');
      }

      console.log('Attempting to open booster:', type, 'for user:', user.id);
      const requestBody = { type, userId: user.id };
      console.log('Request body:', requestBody);

      const res = await fetch('/api/boosters/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));
      
      const textResponse = await res.text();
      console.log('Raw response:', textResponse);

      let data;
      try {
        data = JSON.parse(textResponse);
        console.log('Parsed data:', data);
      } catch (error) {
        console.error('Parse error:', error);
        console.error('Response text:', textResponse);
        throw new Error(`Erreur de parsing: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Failed to open booster');
      }

      setUser({
        ...user,
        credits: user.credits - data.boosterPurchase.cost
      });

      // Transformer les cartes pour l'affichage
      const obtainedCards = data.cards.map((card: any) => ({
        ...card.card,
        isShiny: card.isShiny
      }));

      setRevealedCards(obtainedCards);
      setIsModalOpen(true);

    } catch (error) {
      console.error('Error opening booster:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-game-accent mb-8">Ouvrir des Boosters</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boosters.map((booster) => (
          <div key={booster.type} className="game-card">
            <h2 className="text-xl font-bold text-game-accent mb-2">
              Booster {booster.type.toLowerCase()}
            </h2>
            <p className="text-game-text mb-4">{booster.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-game-success">{booster.cost} crédits</span>
              <span className="text-game-muted">{booster.cardCount} cartes</span>
            </div>
            <button
              onClick={() => {
                console.log('Button clicked for booster:', booster.type);
                handleOpenBooster(booster.type);
              }}
              className="game-button w-full"
              disabled={user?.credits < booster.cost}
            >
              Ouvrir
            </button>
          </div>
        ))}
      </div>
      
      <CardRevealModal
        cards={revealedCards}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default OpenBoosters; 