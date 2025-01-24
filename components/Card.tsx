import React from 'react';
import type { Rarity } from '@prisma/client';

export interface CardProps {
  id: number;
  name: string;
  rarity: Rarity;
  description: string;
  quote?: string;
  power: number;
  isShiny: boolean;
  imageUrl: string;
  quantity?: number;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  name,
  rarity,
  description,
  quote,
  power,
  isShiny,
  imageUrl,
  quantity,
  className = '',
}) => {
  return (
    <div
      className={`
        relative w-64 h-96 p-4 rounded-lg border-2
        ${isShiny ? 'animate-shine border-yellow-400' : 'border-game-muted'}
        ${getRarityStyle(rarity)}
        ${className}
      `}
    >
      <div className="w-full h-40 mb-2 overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{name}</h3>
        <span className={`text-sm ${isShiny ? 'text-yellow-400' : 'text-game-muted'}`}>
          {isShiny ? '✨ Shiny' : rarity}
        </span>
      </div>

      <p className="text-sm mb-2 h-16 overflow-y-auto">{description}</p>

      {quote && (
        <p className="text-sm italic text-game-muted mb-2 h-12 overflow-y-auto">
          &ldquo;{quote}&rdquo;
        </p>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <span className="text-game-accent">Power: {power}</span>
        {quantity && (
          <span className="text-game-success">
            x{quantity}
          </span>
        )}
      </div>
    </div>
  );
};

const getRarityStyle = (rarity: Rarity) => {
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

export default Card; 