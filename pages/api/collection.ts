import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Récupérer l'ID de l'utilisateur depuis le cookie
    const authCookie = req.cookies.auth;
    if (!authCookie) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const userId = parseInt(authCookie);
    if (isNaN(userId)) {
      return res.status(401).json({ message: 'Session invalide' });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer uniquement les cartes de l'utilisateur connecté
    const collectedCards = await prisma.collectedCard.findMany({
      where: {
        userId: userId
      },
      include: {
        card: true
      },
      orderBy: [
        { card: { rarity: 'desc' } },
        { isShiny: 'desc' },
        { card: { name: 'asc' } }
      ]
    });

    return res.status(200).json(collectedCards);
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 