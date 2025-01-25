import React from 'react';
import type { Rarity } from '@prisma/client';
import Image from 'next/image';

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
  isNew?: boolean;
  onHover?: () => void;
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
  isNew,
  onHover,
  className = '',
}) => {
  return (
    <div
      className={`
        relative w-64 h-96 p-4 rounded-lg border-2 card-base
        ${isShiny ? 'animate-shine border-yellow-400 card-shiny' : 'border-game-muted'}
        ${getRarityStyle(rarity)}
        ${isNew ? 'ring-4 ring-white ring-opacity-20' : ''}
        ${className}
      `}
      onMouseEnter={isNew ? onHover : undefined}
    >
      {/* Power Bubble */}
      <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full bg-game-accent flex items-center justify-center border-2 border-game-dark z-10">
        <span className="text-lg font-bold text-game-dark">{power}</span>
      </div>

      {/* Image de la carte */}
      <div className="relative w-full h-48 mb-4 overflow-hidden rounded">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
        />
      </div>

      {/* En-tête de la carte */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{name}</h3>
        <span className={`text-sm ${isShiny ? 'text-yellow-400' : 'text-game-muted'}`}>
          {isShiny ? '✨ Shiny' : rarity}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm mb-2 h-20 overflow-y-auto">{description}</p>

      {/* Citation */}
      {quote && (
        <p className="text-sm italic text-game-muted mb-2 h-12 overflow-y-auto">
          &ldquo;{quote}&rdquo;
        </p>
      )}

      {/* Quantité (si présente) */}
      {quantity && (
        <div className="absolute bottom-4 right-4">
          <span className="text-game-success font-medium">
            x{quantity}
          </span>
        </div>
      )}
    </div>
  );
};

const getRarityStyle = (rarity: Rarity) => {
  switch (rarity) {
    case 'LEGENDARY':
      return 'rarity-legendary';
    case 'RARE':
      return 'rarity-rare';
    case 'UNCOMMON':
      return 'rarity-uncommon';
    default:
      return 'rarity-common';
  }
};

export default Card; 