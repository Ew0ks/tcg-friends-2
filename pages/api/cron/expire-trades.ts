import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { TradeStatus } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier que la requête vient bien d'un service de cron
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  try {
    // Trouver toutes les offres expirées
    const expiredTrades = await prisma.tradeOffer.updateMany({
      where: {
        status: TradeStatus.PENDING,
        expiresAt: {
          lt: new Date()
        }
      },
      data: {
        status: TradeStatus.EXPIRED
      }
    });

    res.status(200).json({
      message: `${expiredTrades.count} offres d'échange ont été marquées comme expirées`
    });
  } catch (error) {
    console.error('Erreur lors de l\'expiration des offres d\'échange:', error);
    res.status(500).json({ message: 'Erreur lors de l\'expiration des offres d\'échange' });
  }
} 