import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Rarity, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

type SortOption = 'date-asc' | 'date-desc' | 'rarity-asc' | 'rarity-desc' | 'name-asc' | 'name-desc';

const getSortOrder = (sort: SortOption | string): Prisma.CollectedCardOrderByWithRelationInput => {
  switch (sort) {
    case 'date-asc':
      return { createdAt: 'asc' };
    case 'date-desc':
      return { createdAt: 'desc' };
    case 'rarity-asc':
      return { card: { rarity: 'asc' } };
    case 'rarity-desc':
      return { card: { rarity: 'desc' } };
    case 'name-asc':
      return { card: { name: 'asc' } };
    case 'name-desc':
      return { card: { name: 'desc' } };
    default:
      return { card: { rarity: 'desc' } };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Récupérer les paramètres de filtre de la requête
    const { search, rarity, shiny, sort = 'rarity-desc' } = req.query;

    // Construire la requête avec les filtres
    const where: Prisma.CollectedCardWhereInput = {
      userId: session.user.id,
      ...(shiny === 'true' || shiny === 'false' ? { isShiny: shiny === 'true' } : {}),
      card: {
        ...(search ? {
          name: {
            contains: search as string,
            mode: 'insensitive',
          },
        } : {}),
        ...(rarity ? { rarity: rarity as Rarity } : {}),
      },
    };

    // Récupérer les cartes collectées avec les filtres
    const collectedCards = await prisma.collectedCard.findMany({
      where,
      include: {
        card: true,
      },
      orderBy: getSortOrder(sort as string),
    });

    // Récupérer le nombre total de cartes dans le jeu
    const totalCards = await prisma.card.count();
    const totalPossibleCards = totalCards * 2; // Normal + Shiny

    // Calculer les statistiques
    const uniqueCards = await prisma.collectedCard.count({
      where: { userId: session.user.id },
    });

    const shinyCards = await prisma.collectedCard.count({
      where: { 
        userId: session.user.id,
        isShiny: true,
      },
    });

    const totalCollectedCards = await prisma.collectedCard.aggregate({
      where: { userId: session.user.id },
      _sum: {
        quantity: true,
      },
    });

    // Calculer le nombre de cartes manquantes et le pourcentage de complétion
    const missingCards = totalPossibleCards - uniqueCards;
    const completionPercentage = Math.round((uniqueCards / totalPossibleCards) * 100);

    return res.status(200).json({
      cards: collectedCards,
      stats: {
        totalCards: totalCollectedCards._sum.quantity || 0,
        uniqueCards,
        shinyCards,
        missingCards,
        completionPercentage,
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 