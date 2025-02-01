import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Rarity, BoosterType, Card, GameSettingKey, GameSettings } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

interface GeneratedCard {
  card: Card;
  isShiny: boolean;
}

// Poids pour la génération aléatoire des raretés
const BASE_RARITY_WEIGHTS = {
  [Rarity.COMMON]: 70,
  [Rarity.UNCOMMON]: 20,
  [Rarity.RARE]: 8,
  [Rarity.EPIC]: 1.5,
  [Rarity.LEGENDARY]: 0.5,
};

// Chance d'obtenir une carte en version shiny
const SHINY_CHANCE = 0.05;

// Fonction pour vérifier si le boost est actif
async function isBoostActive(): Promise<boolean> {
  const settings = await prisma.gameSettings.findMany({
    where: {
      key: {
        in: [
          GameSettingKey.BOOST_DROP_RATE_ENABLED,
          GameSettingKey.BOOST_DROP_RATE_START,
          GameSettingKey.BOOST_DROP_RATE_END,
        ],
      },
    },
  });

  const enabled = settings.find((s: GameSettings) => s.key === GameSettingKey.BOOST_DROP_RATE_ENABLED)?.value === 'true';
  if (!enabled) return false;

  const startDate = new Date(settings.find((s: GameSettings) => s.key === GameSettingKey.BOOST_DROP_RATE_START)?.value || '');
  const endDate = new Date(settings.find((s: GameSettings) => s.key === GameSettingKey.BOOST_DROP_RATE_END)?.value || '');
  const now = new Date();

  return now >= startDate && now <= endDate;
}

// Fonction pour obtenir les poids de rareté actuels
async function getCurrentRarityWeights(): Promise<typeof BASE_RARITY_WEIGHTS> {
  const isBoost = await isBoostActive();
  
  if (!isBoost) return BASE_RARITY_WEIGHTS;

  // Doubler les chances pour toutes les cartes non communes
  return {
    [Rarity.COMMON]: BASE_RARITY_WEIGHTS[Rarity.COMMON],
    [Rarity.UNCOMMON]: BASE_RARITY_WEIGHTS[Rarity.UNCOMMON] * 2,
    [Rarity.RARE]: BASE_RARITY_WEIGHTS[Rarity.RARE] * 2,
    [Rarity.EPIC]: BASE_RARITY_WEIGHTS[Rarity.EPIC] * 2,
    [Rarity.LEGENDARY]: BASE_RARITY_WEIGHTS[Rarity.LEGENDARY] * 2,
  };
}

// Fonction pour déterminer une rareté aléatoire
async function getRandomRarity(boosterType?: BoosterType): Promise<Rarity> {
  // Logique spéciale pour le booster épique
  if (boosterType === BoosterType.EPIC) {
    const roll = Math.random();
    if (roll < 0.05) return Rarity.LEGENDARY;
    if (roll < 0.50) return Rarity.EPIC;
    // Pour les 50% restants, on utilise la distribution normale
  }

  const weights = await getCurrentRarityWeights();
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;

  // Pour les boosters standards, rares et maxi, on vérifie la rareté minimale
  const minRarity = boosterType === BoosterType.RARE || boosterType === BoosterType.MAXI ? Rarity.RARE :
                   boosterType === BoosterType.STANDARD ? Rarity.UNCOMMON :
                   undefined;

  for (const [rarity, weight] of Object.entries(weights)) {
    if (minRarity && rarity < minRarity) continue;
    random -= weight;
    if (random <= 0) return rarity as Rarity;
  }

  return Rarity.COMMON;
}

// Fonction pour récupérer une carte aléatoire d'une rareté donnée
async function getRandomCard(rarity: Rarity): Promise<Card> {
  const cards = await prisma.card.findMany({
    where: { rarity },
  });

  if (cards.length === 0) {
    throw new Error(`Aucune carte de rareté ${rarity} trouvée`);
  }

  return cards[Math.floor(Math.random() * cards.length)];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const { type } = req.body;
    if (!type || !Object.values(BoosterType).includes(type)) {
      return res.status(400).json({ message: 'Type de booster invalide' });
    }

    // Récupérer la configuration du booster
    const boosterConfig = await prisma.boosterConfig.findUnique({
      where: { type },
    });

    if (!boosterConfig) {
      return res.status(404).json({ message: 'Configuration de booster non trouvée' });
    }

    // Vérifier les crédits de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.credits < boosterConfig.cost) {
      return res.status(400).json({ message: 'Crédits insuffisants' });
    }

    // Générer les cartes selon le type de booster
    const cards: GeneratedCard[] = [];

    // Générer les cartes
    for (let i = 0; i < boosterConfig.cardCount; i++) {
      const rarity = await getRandomRarity(type);
      const card = await getRandomCard(rarity);
      const isShiny = Math.random() < SHINY_CHANCE;
      cards.push({ card, isShiny });
    }

    // Mettre à jour les statistiques de l'utilisateur
    const legendaryCount = cards.filter(c => c.card.rarity === Rarity.LEGENDARY).length;
    const shinyCount = cards.filter(c => c.isShiny).length;

    // Créer l'achat du booster et les cartes obtenues dans une transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Créer l'achat du booster
      const boosterPurchase = await prisma.boosterPurchase.create({
        data: {
          userId: session.user.id,
          type,
          cost: boosterConfig.cost,
        },
      });

      // Ajouter les cartes à la collection de l'utilisateur
      const cardPromises = cards.map(({ card, isShiny }) =>
        prisma.collectedCard.upsert({
          where: {
            userId_cardId_isShiny: {
              userId: session.user.id,
              cardId: card.id,
              isShiny,
            },
          },
          update: {
            quantity: {
              increment: 1,
            },
          },
          create: {
            userId: session.user.id,
            cardId: card.id,
            isShiny,
            quantity: 1,
            isNew: true,
          },
        })
      );

      await Promise.all(cardPromises);

      // Mettre à jour les crédits et statistiques de l'utilisateur
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            decrement: boosterConfig.cost,
          },
          totalBoostersOpened: {
            increment: 1,
          },
          legendaryCardsFound: {
            increment: legendaryCount,
          },
          shinyCardsFound: {
            increment: shinyCount,
          },
        },
      });

      return { boosterPurchase, cards };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du booster:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 