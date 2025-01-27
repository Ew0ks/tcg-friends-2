import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { Rarity } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const userId = parseInt(req.query.userId as string);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID utilisateur invalide' });
  }

  try {
    // Vérifier que l'utilisateur existe et que sa collection est publique
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        isPublic: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (!user.isPublic) {
      return res.status(403).json({ error: 'Cette collection est privée' });
    }

    // Construire la requête avec les filtres
    const where = {
      userId,
      ...(req.query.rarity ? { card: { rarity: req.query.rarity as Rarity } } : {}),
      ...(req.query.shiny ? { isShiny: req.query.shiny === 'true' } : {}),
    };

    // Récupérer les cartes avec les filtres
    const cards = await prisma.collectedCard.findMany({
      where,
      include: {
        card: true,
      },
      orderBy: (() => {
        switch (req.query.sort) {
          case 'date-desc':
            return { createdAt: 'desc' };
          case 'date-asc':
            return { createdAt: 'asc' };
          case 'rarity-desc':
            return { card: { rarity: 'desc' } };
          case 'rarity-asc':
            return { card: { rarity: 'asc' } };
          case 'name-asc':
            return { card: { name: 'asc' } };
          case 'name-desc':
            return { card: { name: 'desc' } };
          default:
            return { card: { rarity: 'desc' } };
        }
      })(),
    });

    // Calculer les statistiques
    const totalCards = cards.reduce((acc, card) => acc + card.quantity, 0);
    const uniqueCards = cards.length;
    const shinyCards = cards.filter(card => card.isShiny).length;

    // Compter le nombre total de cartes possibles
    const totalPossibleCards = await prisma.card.count();
    const missingCards = totalPossibleCards - uniqueCards;
    const completionPercentage = Math.round((uniqueCards / totalPossibleCards) * 100);

    return res.status(200).json({
      username: user.username,
      cards,
      stats: {
        totalCards,
        uniqueCards,
        shinyCards,
        missingCards,
        completionPercentage,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
} 