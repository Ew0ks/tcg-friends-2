import { Rarity } from '@prisma/client';
import { Card } from './cards';

export interface RarityFiltersProps {
  selectedRarity: Rarity | null;
  onChange: (rarity: Rarity | null) => void;
  className?: string;
}

export interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCards: {
    card: Card;
    isShiny: boolean;
    quantity: number;
  }[];
  recipientCards: {
    card: Card;
    isShiny: boolean;
    quantity: number;
  }[];
  recipientId: number;
  onSubmit: (data: {
    recipientId: number;
    offeredCards: { cardId: number; isShiny: boolean; quantity: number }[];
    requestedCards: { cardId: number; isShiny: boolean; quantity: number }[];
    message?: string;
  }) => void;
}

export interface SaleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recap: {
    COMMON: number;
    UNCOMMON: number;
    RARE: number;
    EPIC: number;
    LEGENDARY: number;
    shinyCount: number;
    totalCards: number;
  };
  totalPrice: number;
} 