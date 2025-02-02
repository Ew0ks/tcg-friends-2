import { Achievement, AchievementCategory, UserAchievement } from '@prisma/client';

export type AchievementWithProgress = Achievement & {
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
};

export type AchievementProgress = {
  achievementCode: string;
  currentValue: number;
};

export interface AchievementHandler {
  category: AchievementCategory;
  check: (userId: number) => Promise<AchievementProgress[]>;
}

export type AchievementUpdateEvent = {
  userId: number;
  type: 'COLLECTION_UPDATE' | 'TRADE_COMPLETE' | 'BOOSTER_OPENED';
  data?: any;
}; 