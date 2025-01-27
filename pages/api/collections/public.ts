import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer la session de l'utilisateur connecté
    const session = await getServerSession(req, res, authOptions);
    const currentUserId = session?.user?.id;

    // Récupérer tous les utilisateurs avec une collection publique, sauf l'utilisateur connecté
    const users = await prisma.user.findMany({
      where: {
        isPublic: true,
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
      },
      select: {
        id: true,
        username: true,
        collectedCards: {
          include: {
            card: true,
          },
        },
      },
    });

    // Calculer les statistiques pour chaque utilisateur
    const usersWithStats = users.map(user => {
      const totalCards = user.collectedCards.reduce((acc, card) => acc + card.quantity, 0);
      const uniqueCards = user.collectedCards.length;
      const shinyCards = user.collectedCards.filter(card => card.isShiny).length;

      return {
        id: user.id,
        username: user.username,
        stats: {
          totalCards,
          uniqueCards,
          shinyCards,
        },
      };
    });

    return res.status(200).json({ users: usersWithStats });
  } catch (error) {
    console.error('Erreur lors de la récupération des collections:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
} 