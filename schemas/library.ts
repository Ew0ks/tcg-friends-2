import { Card as CardType } from '@prisma/client';

export interface LibraryCard extends CardType {
  setName: string;
  setCode: string;
}

export interface CardDisplayProps {
  card: LibraryCard;
  onEdit?: (cardId: number) => void;
  onDelete?: (cardId: number) => void;
} 