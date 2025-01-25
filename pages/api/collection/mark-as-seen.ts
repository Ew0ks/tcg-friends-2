import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { userId, cardId, isShiny } = req.body;

    if (!userId || !cardId) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }

    await prisma.collectedCard.update({
      where: {
        userId_cardId_isShiny: {
          userId: parseInt(userId),
          cardId: parseInt(cardId),
          isShiny: isShiny || false,
        },
      },
      data: {
        isNew: false,
      },
    });

    return res.status(200).json({ message: 'Carte marquée comme vue' });
  } catch (error) {
    console.error('Erreur lors du marquage de la carte:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 