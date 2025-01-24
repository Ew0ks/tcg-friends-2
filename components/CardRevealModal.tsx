import React from 'react';
import Card, { CardProps } from './Card';

interface CardRevealModalProps {
  cards: CardProps[];
  isOpen: boolean;
  onClose: () => void;
}

const CardRevealModal: React.FC<CardRevealModalProps> = ({ cards, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-game-dark p-6 rounded-lg max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-game-accent">
            Cartes obtenues !
          </h2>
          <button
            onClick={onClose}
            className="text-game-muted hover:text-game-text"
          >
            Fermer
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card
              key={`${card.id}-${card.isShiny}`}
              {...card}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardRevealModal; 