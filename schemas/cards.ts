import { Rarity } from '@prisma/client';

export interface Card {
  id: number;
  name: string;
  rarity: Rarity;
  description: string;
  quote?: string;
  power: number;
  imageUrl: string;
  isShiny: boolean;
}

export interface CollectedCard {
  id: number;
  cardId: number;
  isShiny: boolean;
  quantity: number;
  card: Card;
}

export interface CardProps extends Card {
  isNew?: boolean;
  quantity?: number;
  className?: string;
  onHover?: () => void;
} 