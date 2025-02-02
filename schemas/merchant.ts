import { Rarity } from '@prisma/client';

export interface PriceConfig {
  single: number;
  bulk: number;
  bulkQuantity: number;
}

export interface SaleRecap {
  COMMON: number;
  UNCOMMON: number;
  RARE: number;
  EPIC: number;
  LEGENDARY: number;
  shinyCount: number;
  totalCards: number;
}

export const SHINY_MULTIPLIER = 1.5;

export const BASE_PRICES: Record<Rarity, PriceConfig> = {
  COMMON: {
    single: 1,
    bulk: 15,
    bulkQuantity: 10
  },
  UNCOMMON: {
    single: 2,
    bulk: 25,
    bulkQuantity: 10
  },
  RARE: {
    single: 5,
    bulk: 70,
    bulkQuantity: 10
  },
  EPIC: {
    single: 20,
    bulk: 250,
    bulkQuantity: 10
  },
  LEGENDARY: {
    single: 50,
    bulk: 600,
    bulkQuantity: 10
  }
}; 