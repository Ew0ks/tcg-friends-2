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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-game-dark p-8 rounded-lg w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card) => (
            <div key={`${card.id}-${card.isShiny}`} className="flex justify-center">
              <Card {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardRevealModal; 