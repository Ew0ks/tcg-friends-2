import React, { useRef, useEffect } from 'react';
import Card, { CardProps } from './Card';

interface CardRevealModalProps {
  cards: CardProps[];
  isOpen: boolean;
  onClose: () => void;
}

const CardRevealModal: React.FC<CardRevealModalProps> = ({ cards, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-game-dark rounded-lg max-h-[90vh] w-full max-w-6xl overflow-y-auto">
        {/* En-tête du modal */}
        <div className="sticky top-0 bg-game-dark p-6 border-b border-game-muted">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-game-accent">
              Cartes obtenues !
            </h2>
            <button
              onClick={onClose}
              className="text-game-muted hover:text-game-text transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
        
        {/* Contenu du modal */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {cards.map((card) => (
              <div key={`${card.id}-${card.isShiny}`} className="w-full flex justify-center">
                <Card
                  {...card}
                  className="transform hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardRevealModal; 