import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();
const DEFAULT_DAILY_REWARD = 45;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Récupérer le montant de la récompense depuis les paramètres
    const rewardSetting = await prisma.gameSettings.findUnique({
      where: { key: 'DAILY_REWARD_AMOUNT' },
    });

    const rewardAmount = rewardSetting ? parseInt(rewardSetting.value) : DEFAULT_DAILY_REWARD;

    // Récupérer l'utilisateur et sa dernière récompense
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        credits: true,
        lastDailyReward: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur peut recevoir sa récompense
    const now = new Date();
    const lastReward = user.lastDailyReward;
    
    if (lastReward) {
      const lastRewardDate = new Date(lastReward);
      const isSameDay = 
        lastRewardDate.getDate() === now.getDate() &&
        lastRewardDate.getMonth() === now.getMonth() &&
        lastRewardDate.getFullYear() === now.getFullYear();

      if (isSameDay) {
        return res.status(400).json({ 
          message: 'Vous avez déjà reçu votre récompense quotidienne aujourd\'hui',
          nextReward: new Date(now.setHours(24, 0, 0, 0)),
        });
      }
    }

    // Mettre à jour les crédits et la date de dernière récompense
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: user.credits + rewardAmount,
        lastDailyReward: now,
      },
      select: {
        credits: true,
        lastDailyReward: true,
      },
    });

    return res.status(200).json({
      message: `Vous avez reçu ${rewardAmount} crédits !`,
      newCredits: updatedUser.credits,
      nextReward: new Date(now.setHours(24, 0, 0, 0)),
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la récompense quotidienne:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 