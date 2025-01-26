import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Card from '../components/Card';

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
  const [stats, setStats] = useState({
    totalCards: 0,
    uniqueCards: 0,
    shinyCards: 0,
  });

  useEffect(() => {
    const fetchCollectedCards = async () => {
      const res = await fetch('/api/collection');
      const data = await res.json();
      setCollectedCards(data);

      // Calculer les statistiques
      const stats = {
        totalCards: data.reduce((acc: number, card: CollectedCard) => acc + card.quantity, 0),
        uniqueCards: data.length,
        shinyCards: data.filter((card: CollectedCard) => card.isShiny).length,
      };
      setStats(stats);
    };

    if (session?.user) {
      fetchCollectedCards();
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

      // Mettre à jour l'état local
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
      {/* Stats de collection */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="game-card text-center">
          <h3 className="text-xl font-bold text-game-accent">Total des cartes</h3>
          <p className="text-2xl">{stats.totalCards}</p>
        </div>
        <div className="game-card text-center">
          <h3 className="text-xl font-bold text-game-accent">Cartes uniques</h3>
          <p className="text-2xl">{stats.uniqueCards}</p>
        </div>
        <div className="game-card text-center">
          <h3 className="text-xl font-bold text-game-accent">Cartes Shiny</h3>
          <p className="text-2xl">{stats.shinyCards}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-game-accent mb-6">Votre Collection</h2>
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