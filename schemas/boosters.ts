import { BoosterType, Rarity } from '@prisma/client';
import { Card } from './cards';

export interface GeneratedCard extends Card {
  isShiny: boolean;
}

export interface BoosterConfig {
  type: BoosterType;
  cardCount: number;
  price: number;
  guaranteedRarity?: Rarity;
}

export const BASE_RARITY_WEIGHTS = {
  [Rarity.COMMON]: 70,
  [Rarity.UNCOMMON]: 20,
  [Rarity.RARE]: 8,
  [Rarity.EPIC]: 1.5,
  [Rarity.LEGENDARY]: 0.5,
};

export const BOOSTER_CONFIGS: Record<BoosterType, BoosterConfig> = {
  [BoosterType.STANDARD]: {
    type: BoosterType.STANDARD,
    cardCount: 4,
    price: 100,
    guaranteedRarity: Rarity.UNCOMMON
  },
  [BoosterType.RARE]: {
    type: BoosterType.RARE,
    cardCount: 4,
    price: 170,
    guaranteedRarity: Rarity.RARE
  },
  [BoosterType.EPIC]: {
    type: BoosterType.EPIC,
    cardCount: 4,
    price: 300
  },
  [BoosterType.MAXI]: {
    type: BoosterType.MAXI,
    cardCount: 6,
    price: 500,
    guaranteedRarity: Rarity.RARE
  }
}; 