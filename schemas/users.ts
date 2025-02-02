export interface UserStats {
  totalBoostersOpened: number;
  legendaryCardsFound: number;
  shinyCardsFound: number;
  totalCards: number;
  uniqueCards: number;
  username: string;
  isPublic: boolean;
}

export interface UserSettings {
  isPublic: boolean;
} 