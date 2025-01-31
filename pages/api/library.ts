import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '../../lib/prisma';
import { authOptions } from './auth/[...nextauth]';
import { Rarity } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const userId = Number(session.user.id);
    const rarityFilter = req.query.rarity as Rarity | undefined;

    // Récupérer toutes les cartes avec le filtre de rareté si spécifié
    const cards = await prisma.card.findMany({
      where: rarityFilter ? {
        rarity: rarityFilter
      } : undefined,
      orderBy: [
        { rarity: 'desc' },
        { name: 'asc' }
      ]
    });

    // Récupérer les cartes possédées par l'utilisateur
    const userCards = await prisma.collectedCard.findMany({
      where: {
        userId,
        cardId: {
          in: cards.map(card => card.id)
        }
      },
      select: {
        cardId: true
      }
    });

    // Créer un Set des IDs des cartes possédées pour une recherche plus rapide
    const ownedCardIds = new Set(userCards.map(uc => uc.cardId));

    // Marquer les cartes comme possédées ou non
    const cardsWithOwnership = cards.map(card => ({
      ...card,
      isOwned: ownedCardIds.has(card.id)
    }));

    return res.status(200).json({ cards: cardsWithOwnership });
  } catch (error) {
    console.error('Erreur lors de la récupération de la bibliothèque:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
} 