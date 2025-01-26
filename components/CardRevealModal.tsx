import React, { useCallback, useState } from 'react';
import Card, { CardProps } from './Card';

interface CardRevealModalProps {
  cards: CardProps[];
  isOpen: boolean;
  onClose: () => void;
}

const CardRevealModal: React.FC<CardRevealModalProps> = ({ cards, isOpen, onClose }) => {
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleCardClick = (index: number) => {
    setRevealedCards(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  const handleRevealAll = () => {
    const allIndexes = Array.from({ length: cards.length }, (_, i) => i);
    setRevealedCards(new Set(allIndexes));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-game-dark p-8 rounded-lg w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-game-accent">
            Cartes obtenues !
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRevealAll}
              className="text-game-accent hover:text-game-text transition-colors"
            >
              Tout révéler
            </button>
            <button
              onClick={onClose}
              className="text-game-muted hover:text-game-text transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ">
          {cards.map((card, index) => (
            <div 
              key={`${card.id}-${card.isShiny}-${index}`} 
              className={`flex justify-center game-card ${revealedCards.has(index) ? 'flipped' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <Card 
                {...card} 
              />
              <div />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardRevealModal; 