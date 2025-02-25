import React, { useState } from 'react';
import Card, { CardProps } from './Card';
import Modal from './Modal';
import { CARD_DIMENSIONS, CARD_GRID_SCALE } from '../constants/cardDimensions';

interface CardRevealModalProps {
  cards: CardProps[];
  isOpen: boolean;
  onClose: () => void;
}

const CardRevealModal: React.FC<CardRevealModalProps> = ({ cards, isOpen, onClose }) => {
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

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

  const footer = (
    <div className="flex justify-end gap-4">
      <button
        onClick={handleRevealAll}
        className="text-game-accent hover:text-game-text transition-colors"
      >
        Tout révéler
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cartes obtenues !"
      maxWidth="full"
      footer={footer}
    >
      <div className="modal-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <div 
            key={`${card.id}-${card.isShiny}-${index}`} 
            className={`flex justify-center game-card ${revealedCards.has(index) ? 'flipped' : ''} ${CARD_GRID_SCALE.margin}`}
            onClick={() => handleCardClick(index)}
          >
            <Card {...card} />
            <div style={CARD_DIMENSIONS.style} />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default CardRevealModal; 