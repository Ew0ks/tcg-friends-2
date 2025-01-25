'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import type { Card as CardType } from '@prisma/client';

interface CollectedCard {
  card: CardType;
  isShiny: boolean;
  quantity: number;
  isNew: boolean;
}

const Collection: React.FC = () => {
  const { user } = useAuth();
  const [collectedCards, setCollectedCards] = useState<CollectedCard[]>([]);
  const [stats, setStats] = useState({
    totalCards: 0,
    uniqueCards: 0,
    shinyCards: 0,
  });

  useEffect(() => {
    const fetchCollectedCards = async () => {
      try {
        const res = await fetch('/api/collection', {
          credentials: 'include'
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch collection');
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data)) {
          console.error('Expected array of cards but got:', data);
          setCollectedCards([]);
          setStats({
            totalCards: 0,
            uniqueCards: 0,
            shinyCards: 0,
          });
          return;
        }
        
        setCollectedCards(data);

        const stats = {
          totalCards: data.reduce((acc: number, card: CollectedCard) => acc + card.quantity, 0),
          uniqueCards: data.length,
          shinyCards: data.filter((card: CollectedCard) => card.isShiny).length,
        };
        setStats(stats);
      } catch (error) {
        console.error('Erreur lors de la récupération de la collection:', error);
        setCollectedCards([]);
        setStats({
          totalCards: 0,
          uniqueCards: 0,
          shinyCards: 0,
        });
      }
    };

    if (user) {
      fetchCollectedCards();
    }
  }, [user]);

  const handleCardHover = async (cardId: number, isShiny: boolean) => {
    try {
      const response = await fetch('/api/collection/mark-as-seen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId, isShiny }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to mark card as seen');
      }

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
            id={collectedCard.card.id}
            name={collectedCard.card.name}
            rarity={collectedCard.card.rarity}
            description={collectedCard.card.description || ''}
            quote={collectedCard.card.quote || ''}
            power={collectedCard.card.power}
            imageUrl={collectedCard.card.imageUrl}
            isShiny={collectedCard.isShiny}
            quantity={collectedCard.quantity}
            isNew={collectedCard.isNew}
            onHover={() => handleCardHover(collectedCard.card.id, collectedCard.isShiny)}
            className="hover:scale-105 transition-transform hover:ring-0"
          />
        ))}
      </div>
    </div>
  );
};

export default Collection; 