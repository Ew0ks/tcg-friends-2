import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Card from '../components/Card';
import { Rarity } from '@prisma/client';

// Définir le type pour une carte collectée
interface CollectedCard {
  id: number;
  card: {
    id: number;
    name: string;
    rarity: string;
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
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [shinyFilter, setShinyFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('rarity-desc');
  const [stats, setStats] = useState({
    totalCards: 0,
    uniqueCards: 0,
    shinyCards: 0,
    missingCards: 0,
    completionPercentage: 0,
  });

  useEffect(() => {
    const fetchCollectedCards = async () => {
      // Construire l'URL avec les filtres
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRarity) params.append('rarity', selectedRarity);
      if (shinyFilter) params.append('shiny', shinyFilter);
      params.append('sort', sortOrder);

      const res = await fetch(`/api/collection?${params.toString()}`);
      const data = await res.json();
      setCollectedCards(data.cards);

      // Calculer les statistiques
      const totalCards = data.cards.reduce((acc: number, card: CollectedCard) => acc + card.quantity, 0);
      const uniqueCards = data.cards.length;
      const shinyCards = data.cards.filter((card: CollectedCard) => card.isShiny).length;
      const completionPercentage = Math.round((data.stats.totalCollectedCards / data.stats.totalPossibleCards) * 100);

      setStats({
        totalCards,
        uniqueCards,
        shinyCards,
        missingCards: data.stats.missingCards,
        completionPercentage,
      });
    };

    if (session?.user) {
      fetchCollectedCards();
    }
  }, [session, searchTerm, selectedRarity, shinyFilter, sortOrder]);

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Filtres */}
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
              Rareté
            </label>
            <select
              className="game-input w-full"
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
            >
              <option value="">Toutes les raretés</option>
              <option value={Rarity.COMMON}>Commune</option>
              <option value={Rarity.UNCOMMON}>Peu commune</option>
              <option value={Rarity.RARE}>Rare</option>
              <option value={Rarity.LEGENDARY}>Légendaire</option>
            </select>
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

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-game-accent">Votre Collection</h2>
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
          <Card
            key={`${collectedCard.card.id}-${collectedCard.isShiny}`}
            {...collectedCard.card}
            isShiny={collectedCard.isShiny}
            isNew={collectedCard.isNew}
            quantity={collectedCard.quantity}
            className="hover:scale-105 transition-transform"
            onHover={() => handleCardHover(collectedCard.card.id, collectedCard.isShiny)}
          />
        ))}
      </div>
    </div>
  );
};

export default Collection; 