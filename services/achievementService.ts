import prisma from '@/lib/prisma';
import { AchievementUpdateEvent } from '@/types/achievement';

const ACHIEVEMENTS = {
  COLLECTOR_BEGINNER: {
    code: 'COLLECTOR_BEGINNER',
    name: 'Collectionneur Débutant',
    description: 'Collectionnez 10 cartes différentes',
    threshold: 10,
    imageUrl: '/images/achievements/collector-beginner.webp'
  },
  SHINY_HUNTER: {
    code: 'SHINY_HUNTER',
    name: 'Chasseur de Shiny',
    description: 'Obtenez votre première carte Shiny',
    threshold: 1,
    imageUrl: '/images/achievements/shiny-hunter.webp'
  },
  // ... autres achievements
} as const;

export async function updateAchievements(event: AchievementUpdateEvent) {
  const { userId, type } = event;

  switch (type) {
    case 'COLLECTION_UPDATE':
      await checkCollectionAchievements(userId);
      break;
    case 'TRADE_COMPLETE':
      await checkTradeAchievements(userId);
      break;
    case 'BOOSTER_OPENED':
      await checkBoosterAchievements(userId);
      break;
  }
}

async function checkCollectionAchievements(userId: number) {
  // Vérifier les achievements liés à la collection
  const uniqueCards = await prisma.collectedCard.count({
    where: { userId }
  });

  const shinyCards = await prisma.collectedCard.count({
    where: { userId, isShiny: true }
  });

  const legendaryCards = await prisma.collectedCard.count({
    where: {
      userId,
      card: { rarity: 'LEGENDARY' }
    }
  });

  // Mettre à jour les achievements
  await updateAchievementProgress("COLLECTOR_BEGINNER", userId, uniqueCards);
  await updateAchievementProgress("SHINY_HUNTER", userId, shinyCards);
  await updateAchievementProgress("LEGENDARY_HUNTER", userId, legendaryCards);
}

async function checkTradeAchievements(userId: number) {
  const completedTrades = await prisma.tradeOffer.count({
    where: {
      OR: [
        { initiatorId: userId },
        { recipientId: userId }
      ],
      status: 'ACCEPTED'
    }
  });

  await updateAchievementProgress("TRADER_EXPERT", userId, completedTrades);
}

async function checkBoosterAchievements(userId: number) {
  const openedBoosters = await prisma.boosterPurchase.count({
    where: { userId }
  });

  await updateAchievementProgress("BOOSTER_COLLECTOR", userId, openedBoosters);
}

export async function updateAchievementProgress(code: keyof typeof ACHIEVEMENTS, userId: number, currentProgress: number) {
  const achievement = ACHIEVEMENTS[code];
  if (!achievement) return;

  await prisma.userAchievement.upsert({
    where: {
      userId_code: {
        userId,
        code: achievement.code
      }
    },
    create: {
      userId,
      code: achievement.code,
      progress: currentProgress,
      unlockedAt: currentProgress >= achievement.threshold ? new Date() : null
    },
    update: {
      progress: currentProgress,
      unlockedAt: currentProgress >= achievement.threshold ? new Date() : null
    }
  });
} 