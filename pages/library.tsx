import { useEffect, useState } from 'react';
import { Card as CardType, Rarity } from '@prisma/client';
import Card from '../components/Card';
import RarityFilters from '../components/RarityFilters';
import PageTitleTooltip from '../components/PageTitleTooltip';

interface LibraryCard extends CardType {
  isOwned: boolean;
}

type CardDisplayProps = {
  id: number;
  name: string;
  rarity: Rarity;
  description: string;
  quote?: string;
  power: number;
  imageUrl: string;
  isShiny: boolean;
  isOwned: boolean;
};

const Library = () => {
  const [cards, setCards] = useState<LibraryCard[]>([]);
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Définir l'ordre des raretés avec le bon typage
  const rarityOrder = [
    'COMMON',
    'UNCOMMON',
    'RARE',
    'EPIC',
    'LEGENDARY'
  ] as Rarity[];

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedRarity) params.append('rarity', selectedRarity.toString());

        const response = await fetch(`/api/library?${params.toString()}`);
        const data = await response.json();
        setCards(data.cards);
      } catch (error) {
        console.error('Erreur lors du chargement de la bibliothèque:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [selectedRarity]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div>Chargement...</div>
      </div>
    );
  }

  // Grouper les cartes par rareté avec le bon typage
  const cardsByRarity = cards.reduce<Record<Rarity, LibraryCard[]>>((acc, card) => {
    if (!acc[card.rarity]) {
      acc[card.rarity] = [];
    }
    acc[card.rarity].push(card);
    return acc;
  }, {} as Record<Rarity, LibraryCard[]>);

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-game-muted mb-1">Toutes les cartes</p>
          <PageTitleTooltip 
            title="Catalogue"
            tooltip="Découvrez toutes les cartes disponibles dans le jeu, leurs raretés et leurs caractéristiques. Un aperçu complet de ce que vous pouvez collectionner !"
          />
        </div>
        <RarityFilters
          selectedRarity={selectedRarity}
          onChange={setSelectedRarity}
        />
      </div>

      {rarityOrder.map((rarity) => {
        if (!cardsByRarity[rarity]) return null;
        
        return (
          <div key={rarity} className="mb-12">
            <h2 className="text-2xl font-bold text-game-accent mb-6">{rarity}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cardsByRarity[rarity].map((card) => {
                const cardWithShiny: CardDisplayProps = {
                  ...card,
                  isShiny: false,
                  description: card.description || '',
                  quote: card.quote || undefined
                };
                return (
                  <div key={card.id} className="relative">
                    {(rarity !== 'LEGENDARY' || card.isOwned) && (
                      <div className={card.isOwned ? 'opacity-50' : ''}>
                        <Card {...cardWithShiny} />
                      </div>
                    )}
                    {card.isOwned && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-game-accent text-white px-4 py-2 rounded-full transform -rotate-12">
                          Possédée
                        </div>
                      </div>
                    )}
                    {rarity === 'LEGENDARY' && !card.isOwned && (
                      <div className="w-64 h-96 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900 to-game-dark rounded-lg border-2 border-game-muted">
                          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-game-accent flex items-center justify-center border-2 border-game-dark shadow-lg z-10">
                            <span className="text-lg font-bold text-game-dark">?</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-yellow-500/80 text-white px-4 py-2 rounded-full transform -rotate-12">
                            Carte Légendaire
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Library; 