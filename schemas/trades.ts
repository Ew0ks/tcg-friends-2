import { TradeStatus } from '@prisma/client';
import { Card } from './cards';

export interface TradeCard {
  id: number;
  cardId: number;
  isShiny: boolean;
  quantity: number;
  card: Omit<Card, 'isShiny'>;
}

export interface Trade {
  id: number;
  initiatorId: number;
  recipientId: number;
  status: TradeStatus;
  message?: string;
  expiresAt: Date;
  createdAt: Date;
  initiator: {
    username: string;
  };
  recipient: {
    username: string;
  };
  offeredCards: TradeCard[];
  requestedCards: TradeCard[];
}

export interface ApiTradeResponse {
  id: number;
  initiatorId: number;
  recipientId: number;
  status: string;
  message?: string;
  expiresAt: string;
  createdAt: string;
  initiator: {
    username: string;
  };
  recipient: {
    username: string;
  };
  offeredCards: {
    id: number;
    cardId: number;
    isShiny: boolean;
    quantity: number;
    card: {
      id: number;
      name: string;
      rarity: string;
      description: string;
      power: number;
      imageUrl: string;
      quote?: string;
    };
  }[];
  requestedCards: {
    id: number;
    cardId: number;
    isShiny: boolean;
    quantity: number;
    card: {
      id: number;
      name: string;
      rarity: string;
      description: string;
      power: number;
      imageUrl: string;
      quote?: string;
    };
  }[];
} 