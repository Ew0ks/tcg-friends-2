import React, { useEffect, useState } from 'react';
import { BoosterType, Rarity, UserRole } from '@prisma/client';
import CardRevealModal from '../components/CardRevealModal';
import { useGlobalSession } from '../hooks/useGlobalSession';
import { toast } from 'sonner';
import PageTitleTooltip from '../components/PageTitleTooltip';

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

interface DropRates {
  dropRates: Record<Rarity, number>;
  boostActive: boolean;
  shinyChance: number;
}

const OpenBoosters: React.FC = () => {
  const { session, updateCredits } = useGlobalSession();
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openedCards, setOpenedCards] = useState<OpenedCard[]>([]);
  const [currentCredits, setCurrentCredits] = useState<number>(session?.user?.credits || 0);
  const [dropRates, setDropRates] = useState<DropRates | null>(null);

  useEffect(() => {
    if (session?.user?.credits) {
      setCurrentCredits(session.user.credits);
    }
  }, [session?.user?.credits]);

  useEffect(() => {
    const fetchDropRates = async () => {
      if (session?.user?.role === UserRole.ADMIN) {
        try {
          console.log('Récupération des drop rates...');
          const res = await fetch('/api/boosters/drop-rates');
          if (res.ok) {
            const data = await res.json();
            console.log('Nouveaux drop rates reçus:', data);
            setDropRates(data);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des drop rates:', error);
        }
      }
    };

    // Appel initial
    fetchDropRates();

    // Rafraîchir toutes les 30 secondes pour tenir compte des changements de période de boost
    const interval = setInterval(() => {
      console.log('Rafraîchissement des drop rates...');
      fetchDropRates();
    }, 30000);

    return () => clearInterval(interval);
  }, [session?.user?.role]);

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
        throw new Error('Erreur lors de l\'ouverture du booster');
      }

      const data = await res.json();
      
      // Notification en fonction de la rareté des cartes obtenues
      const hasLegendary = data.cards.some((cardData: { card: OpenedCard; isShiny: boolean }) => cardData.card.rarity === 'LEGENDARY');
      const hasShiny = data.cards.some((cardData: { card: OpenedCard; isShiny: boolean }) => cardData.isShiny);
      
      if (hasLegendary && hasShiny) {
        toast.success('🌟 Incroyable ! Une carte légendaire shiny !', { duration: 5000 });
      } else if (hasLegendary) {
        toast.success('✨ Félicitations ! Une carte légendaire !', { duration: 5000 });
      } else if (hasShiny) {
        toast.success('✨ Une carte shiny !', { duration: 3000 });
      } else {
        toast.success('Booster ouvert avec succès !');
      }
      
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
      toast.error('Erreur lors de l\'ouverture du booster');
    }
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    // Mettre à jour la session globale après la fermeture de la modale
    await updateCredits(currentCredits);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <PageTitleTooltip 
          title="Ouvrir des Boosters" 
          tooltip="Dépensez vos crédits pour obtenir de nouvelles cartes. Chaque booster contient un nombre défini de cartes avec des chances différentes d'obtenir des raretés spécifiques. Les cartes peuvent également être obtenues en version Shiny !"
        />
        
        {session?.user?.role === UserRole.ADMIN && dropRates && (
          <div className="flex items-center gap-4 bg-game-panel px-4 py-2 rounded-lg">
            {Object.entries(dropRates.dropRates).map(([rarity, rate]) => {
              const isCommon = rarity === 'COMMON';
              const isRateBoosted = dropRates.boostActive && !isCommon;
              return (
                <div key={rarity} className="flex items-center gap-1">
                  <span className="text-xs font-medium opacity-70">{rarity}</span>
                  <span className={`text-sm font-bold ${isRateBoosted ? 'text-game-accent' : ''}`}>
                    {rate}%
                    {isRateBoosted && <span className="text-[10px] ml-0.5" title="Taux boosté">↑</span>}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium opacity-70">SHINY</span>
              <span className="text-sm font-bold">{dropRates.shinyChance}%</span>
            </div>
            {dropRates.boostActive && (
              <div className="flex items-center gap-1 text-game-accent">
                <span className="animate-pulse text-lg">●</span>
                <span className="text-xs font-medium">Boost actif</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {boosters.map((booster) => {
          const canAfford = currentCredits >= booster.cost;
          return (
            <div 
              key={booster.type} 
              className={`game-panel p-6 flex flex-col items-center border-2 h-[300px] transition-all ${
                !canAfford ? 'opacity-50' : ''
              } ${
                booster.type === BoosterType.EPIC ? 'border-purple-500' :
                booster.type === BoosterType.RARE ? 'border-blue-500' :
                booster.type === BoosterType.MAXI ? 'border-green-500' :
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
                  {booster.type === BoosterType.EPIC && ' (45% épique, 5% légendaire, 50% droprate normal)'}
                  {booster.type === BoosterType.MAXI && ' (min. 1 rare)'}
                </p>
                <div className="flex items-center space-x-2 mb-6">
                  <span className={`text-2xl font-bold ${canAfford ? 'text-game-success' : 'text-game-error'}`}>
                    {booster.cost}
                  </span>
                  <span className="text-game-text">crédits</span>
                </div>
              </div>
              <button
                onClick={() => handleOpenBooster(booster.type)}
                className={`game-button w-full mt-auto ${!canAfford ? 'cursor-not-allowed' : ''}`}
                disabled={!session?.user || !canAfford}
              >
                {canAfford ? 'Ouvrir' : 'Crédits insuffisants'}
              </button>
            </div>
          );
        })}
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