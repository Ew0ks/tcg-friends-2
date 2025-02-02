import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Card from '../components/Card';
import { Rarity } from '@prisma/client';
import RarityFilters from '../components/RarityFilters';
import { toast } from 'sonner';
import PageTitleTooltip from '../components/PageTitleTooltip';

// Définir le type pour une carte collectée
interface CollectedCard {
  id: number;
  card: {
    id: number;
    name: string;
    rarity: Rarity;
    description: string;
    quote?: string;
    power: number;
    imageUrl: string;
  };
  isShiny: boolean;
  isNew: boolean;
  quantity: number;
}

const Collection: React.FC = () => {
  const { data: session } = useSession();
  const [collectedCards, setCollectedCards] = useState<CollectedCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [shinyFilter, setShinyFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('rarity-desc');
  const [stats, setStats] = useState({
    totalCards: 0,
    uniqueCards: 0,
    shinyCards: 0,
    missingCards: 0,
    completionPercentage: 0,
  });
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCollectedCards = async () => {
      // Construire l'URL avec les filtres
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRarity) params.append('rarity', selectedRarity.toString());
      if (shinyFilter) params.append('shiny', shinyFilter);
      params.append('sort', sortOrder);

      const res = await fetch(`/api/collection?${params.toString()}`);
      const data = await res.json();
      setCollectedCards(data.cards);

      // Calculer les statistiques
      setStats({
        totalCards: data.stats.totalCards,
        uniqueCards: data.stats.uniqueCards,
        shinyCards: data.stats.shinyCards,
        missingCards: data.stats.missingCards,
        completionPercentage: data.stats.completionPercentage,
      });
    };

    if (session?.user) {
      fetchCollectedCards();
    }
  }, [session, searchTerm, selectedRarity, shinyFilter, sortOrder]);

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

    fetchSettings();
  }, []);

  useEffect(() => {
    const checkDailyReward = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/daily-reward', {
          method: 'POST',
        });
        const data = await response.json();

        if (response.ok) {
          toast.success(data.message, {
            description: `Revenez demain pour recevoir plus de crédits !`,
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la récompense quotidienne:', error);
      }
    };

    if (session?.user) {
      checkDailyReward();
    }
  }, [session]);

  const handleCardHover = async (cardId: number, isShiny: boolean) => {
    if (!session?.user) return;

    try {
      await fetch('/api/collection/mark-as-seen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          cardId,
          isShiny,
        }),
      });

      setCollectedCards(cards =>
        cards.map(card =>
          card.card.id === cardId && card.isShiny === isShiny
            ? { ...card, isNew: false }
            : card
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage de la carte comme vue:', error);
    }
  };

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

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-game-muted mb-1">Ma collection</p>
          <PageTitleTooltip 
            title="Collection personnelle"
            tooltip="Gérez votre collection de cartes, consultez vos statistiques et définissez la visibilité de votre collection pour les autres joueurs."
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isPublic}
              onChange={handlePrivacyChange}
              disabled={isSaving}
            />
            <div className="w-11 h-6 bg-game-light peer-focus:outline-none rounded-full peer 
              peer-checked:after:translate-x-full peer-checked:after:border-white 
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
              after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
              peer-checked:bg-game-accent">
            </div>
          </label>
          <span className="text-sm text-game-text">Collection publique</span>
        </div>
      </div>

      {/* Stats de collection */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Total des cartes</h3>
          <p className="text-2xl">{stats.totalCards}</p>
        </div>
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Cartes uniques</h3>
          <p className="text-2xl">{stats.uniqueCards}</p>
        </div>
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Cartes Shiny</h3>
          <p className="text-2xl">{stats.shinyCards}</p>
        </div>
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Cartes manquantes</h3>
          <p className="text-2xl text-game-error">{stats.missingCards}</p>
        </div>
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Complétion</h3>
          <p className="text-2xl">{stats.completionPercentage}%</p>
        </div>
      </div>

      <div className="mb-8 game-panel p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-game-muted mb-2">
              Rechercher
            </label>
            <input
              type="text"
              className="game-input w-full"
              placeholder="Rechercher une carte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-game-muted mb-2">
              Version
            </label>
            <select
              className="game-input w-full"
              value={shinyFilter}
              onChange={(e) => setShinyFilter(e.target.value)}
            >
              <option value="">Toutes les versions</option>
              <option value="false">Normal</option>
              <option value="true">Shiny</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-game-accent">Votre Collection</h2>
          <RarityFilters
            selectedRarity={selectedRarity}
            onChange={setSelectedRarity}
          />
        </div>
        <select
          className="game-input ml-4"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="date-desc">Plus récentes d&apos;abord</option>
          <option value="date-asc">Plus anciennes d&apos;abord</option>
          <option value="rarity-desc">Plus rares d&apos;abord</option>
          <option value="rarity-asc">Moins rares d&apos;abord</option>
          <option value="name-asc">A à Z</option>
          <option value="name-desc">Z à A</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collectedCards.map((collectedCard) => (
          <div 
            key={`${collectedCard.card.id}-${collectedCard.isShiny}`} 
            className="relative"
          >
            <Card
              {...collectedCard.card}
              isShiny={collectedCard.isShiny}
              isNew={collectedCard.isNew}
              onHover={() => handleCardHover(collectedCard.card.id, collectedCard.isShiny)}
              quantity={collectedCard.quantity}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collection; 