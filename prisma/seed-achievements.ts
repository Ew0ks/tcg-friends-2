const { PrismaClient, AchievementCategory } = require('@prisma/client');

const prisma = new PrismaClient();

const achievements = [
  {
    code: 'COLLECT_100',
    name: 'Collectionneur Débutant',
    description: 'Collectionnez 100 cartes',
    category: AchievementCategory.COLLECTION,
    threshold: 100,
    imageUrl: '/images/achievements/collector.webp',
  },
  {
    code: 'COLLECT_SHINY_10',
    name: 'Amateur de Brillance',
    description: 'Collectionnez 10 cartes Shiny',
    category: AchievementCategory.SHINY,
    threshold: 10,
    imageUrl: '/images/achievements/shiny.webp',
  },
  {
    code: 'COMPLETE_10_TRADES',
    name: 'Négociateur',
    description: 'Complétez 10 échanges',
    category: AchievementCategory.TRADING,
    threshold: 10,
    imageUrl: '/images/achievements/trader.webp',
  },
  {
    code: 'OPEN_50_BOOSTERS',
    name: 'Ouvreur Compulsif',
    description: 'Ouvrez 50 boosters',
    category: AchievementCategory.BOOSTERS,
    threshold: 50,
    imageUrl: '/images/achievements/booster.webp',
  },
];

async function main() {
  console.log('Début de la création des achievements...');

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }

  console.log('Achievements créés avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 