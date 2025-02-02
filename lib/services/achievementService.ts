import { prisma } from '@/lib/prisma';
import { AchievementCategory } from '@prisma/client';
import { AchievementProgress, AchievementUpdateEvent, AchievementWithProgress } from '@/types/achievement';

class AchievementService {
  private static instance: AchievementService;

  private constructor() {}

  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  async getUserAchievements(userId: number): Promise<AchievementWithProgress[]> {
    const achievements = await prisma.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId },
        },
      },
    });

    return achievements.map((achievement) => {
      const userAchievement = achievement.userAchievements[0];
      return {
        ...achievement,
        progress: userAchievement?.progress || 0,
        isUnlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt,
      };
    });
  }

  async updateProgress(userId: number, achievementCode: string, progress: number): Promise<void> {
    const achievement = await prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) return;

    const userAchievement = await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      update: {
        progress: progress,
        unlockedAt: progress >= achievement.threshold ? new Date() : undefined,
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress: progress,
        unlockedAt: progress >= achievement.threshold ? new Date() : undefined,
      },
    });
  }

  async handleAchievementEvent(event: AchievementUpdateEvent): Promise<void> {
    switch (event.type) {
      case 'COLLECTION_UPDATE':
        await this.checkCollectionAchievements(event.userId);
        break;
      case 'TRADE_COMPLETE':
        await this.checkTradeAchievements(event.userId);
        break;
      case 'BOOSTER_OPENED':
        await this.checkBoosterAchievements(event.userId);
        break;
    }
  }

  private async checkCollectionAchievements(userId: number): Promise<void> {
    const collection = await prisma.userCard.findMany({
      where: { userId },
      include: { card: true },
    });

    const totalCards = collection.length;
    const shinyCards = collection.filter(uc => uc.card.isShiny).length;

    await this.updateProgress(userId, 'COLLECT_100', totalCards);
    await this.updateProgress(userId, 'COLLECT_SHINY_10', shinyCards);
  }

  private async checkTradeAchievements(userId: number): Promise<void> {
    const trades = await prisma.tradeOffer.count({
      where: {
        OR: [
          { initiatorId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    await this.updateProgress(userId, 'COMPLETE_10_TRADES', trades);
  }

  private async checkBoosterAchievements(userId: number): Promise<void> {
    const boosters = await prisma.boosterPurchase.count({
      where: { userId },
    });

    await this.updateProgress(userId, 'OPEN_50_BOOSTERS', boosters);
  }
}

export const achievementService = AchievementService.getInstance(); 