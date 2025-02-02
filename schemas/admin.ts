import { Rarity, UserRole } from '@prisma/client';
import { ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  credits: number;
  totalBoostersOpened: number;
  legendaryCardsFound: number;
  shinyCardsFound: number;
  createdAt: Date;
  isPublic: boolean;
}

export interface BoostSession {
  id: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  description: string;
}

export interface GameSetting {
  id: number;
  key: string;
  value: string;
  type: 'number' | 'string' | 'boolean';
  description: string;
}

export interface UpdateCardData {
  name: string;
  description: string;
  quote?: string;
  rarity: Rarity;
  power: number;
  setId: number;
  imageUrl?: string;
}

export type SortField = 'name' | 'rarity' | 'power' | null;
export type SortOrder = 'asc' | 'desc' | null;

export interface SortableColumnProps {
  field: SortField;
  currentSort: SortField;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
  children: ReactNode;
} 