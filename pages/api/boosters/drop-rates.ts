import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Rarity } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

// Poids pour la génération aléatoire des raretés
const BASE_RARITY_WEIGHTS = {
  [Rarity.COMMON]: 70,
  [Rarity.UNCOMMON]: 20,
  [Rarity.RARE]: 8,
  [Rarity.EPIC]: 1.5,
  [Rarity.LEGENDARY]: 0.5,
};

// Fonction pour vérifier si un boost est actif
async function isBoostActive(): Promise<boolean> {
  const now = new Date();
  
  const activeBoost = await prisma.boostSession.findFirst({
    where: {
      AND: [
        { active: true },
        { startDate: { lte: now } },
        { endDate: { gte: now } },
      ],
    },
  });

  return !!activeBoost;
}

// Fonction pour obtenir les poids de rareté actuels
async function getCurrentRarityWeights(): Promise<typeof BASE_RARITY_WEIGHTS> {
  const isBoost = await isBoostActive();
  console.log('Boost actif:', isBoost);
  
  if (!isBoost) {
    console.log('Retour aux poids de base:', BASE_RARITY_WEIGHTS);
    return BASE_RARITY_WEIGHTS;
  }

  // Doubler les chances pour toutes les cartes non communes
  const boostedWeights = {
    [Rarity.COMMON]: BASE_RARITY_WEIGHTS[Rarity.COMMON],
    [Rarity.UNCOMMON]: BASE_RARITY_WEIGHTS[Rarity.UNCOMMON] * 2,
    [Rarity.RARE]: BASE_RARITY_WEIGHTS[Rarity.RARE] * 2,
    [Rarity.EPIC]: BASE_RARITY_WEIGHTS[Rarity.EPIC] * 2,
    [Rarity.LEGENDARY]: BASE_RARITY_WEIGHTS[Rarity.LEGENDARY] * 2,
  };
  console.log('Poids boostés:', boostedWeights);
  return boostedWeights;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const weights = await getCurrentRarityWeights();
    const total = Object.values(weights).reduce((a, b) => a + b, 0);

    // Calculer les pourcentages pour chaque rareté
    const dropRates = Object.entries(weights).reduce((acc, [rarity, weight]) => ({
      ...acc,
      [rarity]: Math.round((weight / total) * 10000) / 100, // Arrondir à 2 décimales
    }), {});

    const boostActive = await isBoostActive();

    console.log('Réponse finale:', {
      dropRates,
      boostActive,
      shinyChance: 5
    });

    return res.status(200).json({
      dropRates,
      boostActive,
      shinyChance: 5, // 5%
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des drop rates:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 