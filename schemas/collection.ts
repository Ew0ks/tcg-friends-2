import { Card } from './cards';

export interface CollectionApiResponse {
  cards: UserCollectedCard[];
  totalCards: number;
  uniqueCards: number;
}

export interface SelectedCard {
  cardId: number;
  isShiny: boolean;
  quantity: number;
}

export interface UserCollectedCard {
  id: number;
  cardId: number;
  isShiny: boolean;
  quantity: number;
  card: Card;
} 