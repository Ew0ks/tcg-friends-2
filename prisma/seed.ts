import { PrismaClient, Rarity, UserRole, BoosterType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur admin
  const adminPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: UserRole.ADMIN,
      credits: 1000,
    },
  });

  // Créer un utilisateur test
  const userPassword = await bcrypt.hash('test', 10);
  await prisma.user.upsert({
    where: { username: 'test' },
    update: {},
    create: {
      username: 'test',
      password: userPassword,
      role: UserRole.USER,
      credits: 500,
    },
  });

  // Créer les configurations de boosters
  await prisma.boosterConfig.upsert({
    where: { type: BoosterType.STANDARD },
    update: {},
    create: {
      type: BoosterType.STANDARD,
      cost: 100,
      cardCount: 4,
    },
  });

  await prisma.boosterConfig.upsert({
    where: { type: BoosterType.RARE },
    update: {},
    create: {
      type: BoosterType.RARE,
      cost: 170,
      cardCount: 4,
    },
  });

  await prisma.boosterConfig.upsert({
    where: { type: BoosterType.LEGENDARY },
    update: {},
    create: {
      type: BoosterType.LEGENDARY,
      cost: 500,
      cardCount: 1,
    },
  });

  // Créer quelques cartes
  const cards = [
    {
      id: 1,
      name: 'Dragon Ancestral',
      rarity: Rarity.LEGENDARY,
      description: 'Un dragon millénaire aux pouvoirs mystiques',
      quote: 'Sa sagesse n\'a d\'égale que sa puissance',
      power: 95,
      imageUrl: '/images/cards/dragon.jpg',
    },
    {
      id: 2,
      name: 'Mage des Arcanes',
      rarity: Rarity.RARE,
      description: 'Maître des arts mystiques',
      quote: 'La magie coule dans ses veines',
      power: 75,
      imageUrl: '/images/cards/mage.jpg',
    },
    {
      id: 3,
      name: 'Guerrier du Crépuscule',
      rarity: Rarity.UNCOMMON,
      description: 'Un combattant redoutable',
      quote: 'Il frappe quand les ombres s\'allongent',
      power: 60,
      imageUrl: '/images/cards/warrior.jpg',
    },
    {
      id: 4,
      name: 'Apprenti Magicien',
      rarity: Rarity.COMMON,
      description: 'Un jeune étudiant en magie',
      quote: 'Le début d\'un long voyage',
      power: 30,
      imageUrl: '/images/cards/apprentice.jpg',
    },
  ];

  for (const card of cards) {
    await prisma.card.upsert({
      where: { id: card.id },
      update: {},
      create: card,
    });
  }

  console.log('Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 