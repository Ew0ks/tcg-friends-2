import React, { useEffect, useState } from 'react';
import { BoosterType, Rarity } from '@prisma/client';
import CardRevealModal from '../components/CardRevealModal';
import { useGlobalSession } from '../hooks/useGlobalSession';

interface Booster {
  type: BoosterType;
  cost: number;
  cardCount: number;
}

interface OpenedCard {
  id: number;
  name: string;
  rarity: Rarity;
  description: string;
  quote?: string;
  power: number;
  imageUrl: string;
  isShiny: boolean;
}

const OpenBoosters: React.FC = () => {
  const { session, updateCredits } = useGlobalSession();
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openedCards, setOpenedCards] = useState<OpenedCard[]>([]);
  const [currentCredits, setCurrentCredits] = useState<number>(session?.user?.credits || 0);

  useEffect(() => {
    if (session?.user?.credits) {
      setCurrentCredits(session.user.credits);
    }
  }, [session?.user?.credits]);

  const fetchBoosters = async () => {
    const res = await fetch('/api/boosters', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const data = await res.json();
    setBoosters(data);
  };

  useEffect(() => {
    fetchBoosters();
  }, []);

  const handleOpenBooster = async (type: BoosterType) => {
    if (!session?.user) return;

    try {
      const booster = boosters.find(b => b.type === type);
      if (!booster) return;

      const res = await fetch('/api/boosters/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          type,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('Erreur lors de l\'ouverture du booster:', error);
        return;
      }

      const data = await res.json();
      
      // Traitement des cartes obtenues
      const processedCards = data.cards.map((cardData: { card: OpenedCard; isShiny: boolean }) => ({
        ...cardData.card,
        isShiny: cardData.isShiny,
      }));
      
      // Mettre à jour les crédits localement
      const newCredits = currentCredits - booster.cost;
      setCurrentCredits(newCredits);
      
      // Afficher les cartes dans le modal
      setOpenedCards(processedCards);
      setIsModalOpen(true);

    } catch (error) {
      console.error('Erreur lors de l\'ouverture du booster:', error);
    }
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    // Mettre à jour la session globale après la fermeture de la modale
    await updateCredits(currentCredits);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-game-accent mb-8">Ouvrir des Boosters</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {boosters.map((booster) => (
          <div 
            key={booster.type} 
            className={`game-panel p-6 flex flex-col items-center border-2 h-[300px] ${
              booster.type === BoosterType.LEGENDARY ? 'border-purple-500' :
              booster.type === BoosterType.RARE ? 'border-blue-500' :
              'border-gray-500'
            }`}
          >
            <div className="flex-1 flex flex-col items-center">
              <h2 className="text-xl font-bold text-game-accent mb-4">
                Booster {booster.type.toLowerCase()}
              </h2>
              <p className="text-game-text mb-4">
                {booster.cardCount} carte{booster.cardCount > 1 ? 's' : ''}
                {booster.type === BoosterType.STANDARD && ' (min. 1 peu commune)'}
                {booster.type === BoosterType.RARE && ' (min. 1 rare)'}
                {booster.type === BoosterType.LEGENDARY && ' (49% légendaire, 51% droprate normal)'}
              </p>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl font-bold text-game-success">
                  {booster.cost}
                </span>
                <span className="text-game-text">crédits</span>
              </div>
            </div>
            <button
              onClick={() => handleOpenBooster(booster.type)}
              className="game-button w-full mt-auto"
              disabled={!session?.user || currentCredits < booster.cost}
            >
              Ouvrir
            </button>
          </div>
        ))}
      </div>

      <CardRevealModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cards={openedCards}
      />
    </div>
  );
};

export default OpenBoosters; 