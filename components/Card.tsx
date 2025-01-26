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
  imageUrl,
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
        relative w-64 h-96 p-4 rounded-lg border-2
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
        <div className="absolute -top-3 -left-3 bg-game-success text-game-dark text-xs font-bold px-2 py-1 rounded-full transform -rotate-12 shadow-lg border border-game-dark">
          NOUVEAU !
        </div>
      )}

      {/* Bulle de puissance */}
      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-game-accent flex items-center justify-center border-2 border-game-dark shadow-lg">
        <span className="text-lg font-bold text-game-dark">{power}</span>
      </div>

      <div className="w-full h-40 mb-2 overflow-hidden rounded-lg">
      <Image
        src={imageUrl}
        alt={name}
        fill
      />
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{name}</h3>
        {isShiny && (
          <span className="text-sm text-yellow-400">✨ Shiny</span>
        )}
      </div>

      <p className="text-sm mb-2 h-16 overflow-y-auto">{description}</p>

      {quote && (
        <p className="text-sm italic text-game-muted mb-2 h-12 overflow-y-auto">
          &ldquo;{quote}&rdquo;
        </p>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        {quantity && (
          <span className="text-game-success">
            x{quantity}
          </span>
        )}
        <span className={`text-xs ${getRarityTextColor(rarity)}`}>
          {rarity}
        </span>
      </div>
    </div>
  );
};

const getRarityStyle = (rarity: string | Rarity) => {
  switch (rarity) {
    case 'LEGENDARY':
      return 'bg-gradient-to-br from-purple-900 to-game-dark';
    case 'RARE':
      return 'bg-gradient-to-br from-blue-900 to-game-dark';
    case 'UNCOMMON':
      return 'bg-gradient-to-br from-green-900 to-game-dark';
    default:
      return 'bg-game-dark';
  }
};

const getRarityTextColor = (rarity: string | Rarity) => {
  switch (rarity) {
    case 'LEGENDARY':
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