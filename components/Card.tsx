import React, { useState } from 'react';
import type { Rarity } from '@prisma/client';
import Image from 'next/image';
import { CARD_DIMENSIONS } from '../constants/cardDimensions';

export interface CardProps {
  id: number;
  name: string;
  rarity: string | Rarity;
  description: string;
  quote?: string;
  power: number;
  isShiny: boolean;
  isNew?: boolean;
  imageUrl: string;
  quantity?: number;
  selectedQuantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  className?: string;
  onHover?: () => void;
}

const Card: React.FC<CardProps> = ({
  name,
  rarity,
  description,
  quote,
  power,
  isShiny,
  isNew = false,
  imageUrl = '/images/cards/placeholder.webp',
  quantity,
  selectedQuantity = 0,
  onIncrement,
  onDecrement,
  className = '',
  onHover,
}) => {
  const [hasHovered, setHasHovered] = useState(false);

  const handleMouseEnter = () => {
    if (isNew && !hasHovered && onHover) {
      setHasHovered(true);
      onHover();
    }
  };

  return (
    <div
      className={`
        relative w-full h-full ${CARD_DIMENSIONS.padding} rounded-lg border-2 overflow-visible
        ${isShiny ? 'animate-shine border-yellow-400' : 'border-game-muted'}
        ${getRarityStyle(rarity)}
        ${isNew && !hasHovered ? 'animate-pulse' : ''}
        ${className}
      `}
      style={CARD_DIMENSIONS.style}
      data-shiny={isShiny}
      onMouseEnter={handleMouseEnter}
    >
      {/* Badge "Nouveau" */}
      {isNew && !hasHovered && (
        <div className="absolute -top-2 -left-2 bg-game-success text-game-dark text-xs font-bold px-2 py-1 rounded-full transform -rotate-12 shadow-lg border border-game-dark">
          NOUVEAU !
        </div>
      )}

      {/* Bulle de puissance */}
      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-game-accent flex items-center justify-center border-2 border-game-dark shadow-lg z-10 ${isShiny ? 'power-bubble-shine' : ''}`}>
        <span className="text-base font-bold text-game-dark">{power}</span>
      </div>

      <div className={`w-full ${CARD_DIMENSIONS.imageHeight} mb-2 overflow-hidden rounded-lg relative`}>
        <Image
          src={imageUrl}
          alt={name}
          width={CARD_DIMENSIONS.imageWidth}
          height={CARD_DIMENSIONS.nextImageHeight}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex justify-between items-center mb-1">
        <h3 className={`text-base font-bold ${isShiny ? 'shiny-title' : ''}`}>{name}</h3>
      </div>

      <p className={`text-xs mb-1 ${CARD_DIMENSIONS.descriptionHeight} overflow-y-auto`}>{description}</p>

      {quote && (
        <p className={`text-xs italic text-game-muted mb-1 ${CARD_DIMENSIONS.quoteHeight} overflow-y-auto`}>
          &ldquo;{quote}&rdquo;
        </p>
      )}

      {/* Affichage des quantités et boutons */}
      {(onIncrement || onDecrement) && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
            {selectedQuantity > 0 && (
              <>
                <button
                  onClick={onDecrement}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  -
                </button>
                <span className="bg-game-accent text-white px-3 py-1 rounded">
                  {selectedQuantity}
                </span>
              </>
            )}
            {selectedQuantity < (quantity || 0) && onIncrement && (
              <button
                onClick={onIncrement}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                +
              </button>
            )}
          </div>
        </div>
      )}

      {/* Affichage de la quantité totale */}
      {quantity && quantity > 1 && (
        <div className="absolute bottom-[-8px] right-[-8px] bg-game-accent text-white text-xs px-2 py-1 rounded-lg shadow-lg">
          x{quantity}
        </div>
      )}
    </div>
  );
};

const getRarityStyle = (rarity: string | Rarity) => {
  switch (rarity) {
    case 'LEGENDARY':
      return 'bg-gradient-to-br from-yellow-900 to-game-dark';
    case 'EPIC':
      return 'bg-gradient-to-br from-purple-900 to-game-dark';
    case 'RARE':
      return 'bg-gradient-to-br from-blue-900 to-game-dark';
    case 'UNCOMMON':
      return 'bg-gradient-to-br from-green-900 to-game-dark';
    default:
      return 'bg-gradient-to-br from-gray-700 to-gray-900';
  }
};

const getRarityTextColor = (rarity: string | Rarity) => {
  switch (rarity) {
    case 'LEGENDARY':
      return 'text-yellow-400';
    case 'EPIC':
      return 'text-purple-400';
    case 'RARE':
      return 'text-blue-400';
    case 'UNCOMMON':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

export default Card; 