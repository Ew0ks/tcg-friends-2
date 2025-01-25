// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

interface CardTemplate {
  name: string;
  description: string;
  quote?: string;
  power: number;
  rarity: 'LEGENDARY' | 'RARE' | 'UNCOMMON' | 'COMMON';
}

const cardTemplates: CardTemplate[] = [
  // Cartes Légendaires
  {
    name: "Dragon Ancestral",
    description: "Un dragon millénaire dont la puissance n'a d'égal que sa sagesse",
    quote: "Le temps est mon allié éternel",
    power: 10,
    rarity: "LEGENDARY"
  },
  {
    name: "Phénix Immortel",
    description: "Renaît de ses cendres plus puissant que jamais",
    quote: "La mort n'est qu'un nouveau départ",
    power: 9,
    rarity: "LEGENDARY"
  },

  // Cartes Rares
  {
    name: "Chevalier de l'Aube",
    description: "Un guerrier béni par la lumière divine",
    quote: "Pour l'honneur et la justice",
    power: 7,
    rarity: "RARE"
  },
  {
    name: "Sorcier des Arcanes",
    description: "Maître des arts mystiques et gardien des secrets anciens",
    quote: "La connaissance est pouvoir",
    power: 6,
    rarity: "RARE"
  },

  // Cartes Peu Communes
  {
    name: "Archer Elfique",
    description: "Ses flèches ne manquent jamais leur cible",
    quote: "Le vent guide ma flèche",
    power: 4,
    rarity: "UNCOMMON"
  },
  {
    name: "Golem de Pierre",
    description: "Une construction magique d'une solidité à toute épreuve",
    power: 5,
    rarity: "UNCOMMON"
  },

  // Cartes Communes
  {
    name: "Soldat du Royaume",
    description: "Un fidèle combattant des armées royales",
    power: 2,
    rarity: "COMMON"
  },
  {
    name: "Apprenti Mage",
    description: "Débute dans l'art de la magie avec enthousiasme",
    quote: "Un jour, je serai le plus grand",
    power: 1,
    rarity: "COMMON"
  },
];

async function main() {
  // Nettoyer la base de données dans le bon ordre (pour respecter les contraintes de clé étrangère)
  await prisma.$transaction([
    // Supprimer d'abord les tables avec des clés étrangères
    prisma.$executeRaw`DELETE FROM "CardFromBooster"`,
    prisma.$executeRaw`DELETE FROM "CollectedCard"`,
    prisma.$executeRaw`DELETE FROM "BoosterPurchase"`,
    prisma.$executeRaw`DELETE FROM "Card"`,
    prisma.$executeRaw`DELETE FROM "BoosterConfig"`,
    prisma.$executeRaw`DELETE FROM "User"`,
  ]);

  console.log('Base de données nettoyée');

  // Créer les configurations de boosters
  await prisma.boosterConfig.createMany({
    data: [
      {
        type: 'STANDARD',
        cost: 100,
        cardCount: 4,
      },
      {
        type: 'RARE',
        cost: 170,
        cardCount: 4,
      },
      {
        type: 'LEGENDARY',
        cost: 500,
        cardCount: 1,
      },
    ],
  });

  console.log('Configurations de boosters créées');

  // Créer les cartes
  for (const template of cardTemplates) {
    await prisma.card.create({
      data: {
        name: template.name,
        description: template.description,
        quote: template.quote,
        power: template.power,
        rarity: template.rarity,
      },
    });
  }

  console.log('Cartes créées');

  // Créer un utilisateur de test
  await prisma.user.create({
    data: {
      username: 'toto',
      password: '$2b$10$P.WMijZ.1EljcghQwiOzQ.S1RH/.VWC28tmXCEUyNDxBDnTOIaT2i', // mot de passe: toto
      credits: 99999,
    },
  });

  console.log('Utilisateur de test créé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 