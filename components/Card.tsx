import React, { useState } from 'react';
import type { Rarity } from '@prisma/client';
import Image from 'next/image';

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
        relative w-52 h-80 p-3 rounded-lg border-2 overflow-visible
        ${isShiny ? 'animate-shine border-yellow-400' : 'border-game-muted'}
        ${getRarityStyle(rarity)}
        ${isNew && !hasHovered ? 'animate-pulse' : ''}
        ${className}
      `}
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

      <div className="w-full h-32 mb-2 overflow-hidden rounded-lg relative">
        <Image
          src={imageUrl}
          alt={name}
          width={208}
          height={128}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex justify-between items-center mb-1">
        <h3 className={`text-base font-bold ${isShiny ? 'shiny-title' : ''}`}>{name}</h3>
      </div>

      <p className="text-xs mb-1 h-14 overflow-y-auto">{description}</p>

      {quote && (
        <p className="text-xs italic text-game-muted mb-1 h-10 overflow-y-auto">
          &ldquo;{quote}&rdquo;
        </p>
      )}

      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
        <span className={`text-xs ${getRarityTextColor(rarity)}`}>
          {isShiny && <span className="text-yellow-400 shiny-title">✨ Shiny - </span>}{rarity}
        </span>
        {quantity && quantity > 1 && (
          <div className="absolute bottom-[-8px] right-[-8px] bg-game-accent text-white text-xs px-2 py-1 rounded-lg shadow-lg">
            x{quantity}
          </div>
        )}
      </div>
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