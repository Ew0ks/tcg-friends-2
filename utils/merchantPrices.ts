import { Rarity } from '@prisma/client';

interface PriceConfig {
  single: number;
  bulk: number;
  bulkQuantity: number;
}

const PRICES: Record<Rarity, PriceConfig> = {
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

const SHINY_MULTIPLIER = 1.5;

export const calculatePrice = (rarity: Rarity, quantity: number, isShiny: boolean): number => {
  const priceConfig = PRICES[rarity];
  
  if (quantity >= priceConfig.bulkQuantity) {
    const bulkSets = Math.floor(quantity / priceConfig.bulkQuantity);
    const remainder = quantity % priceConfig.bulkQuantity;
    const price = (bulkSets * priceConfig.bulk) + (remainder * priceConfig.single);
    return isShiny ? Math.ceil(price * SHINY_MULTIPLIER) : price;
  }

  const price = quantity * priceConfig.single;
  return isShiny ? Math.ceil(price * SHINY_MULTIPLIER) : price;
};

export const getPriceConfig = (rarity: Rarity): PriceConfig => PRICES[rarity]; 