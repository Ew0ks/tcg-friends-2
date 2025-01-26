import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { calculatePrice } from '../../../utils/merchantPrices';
import { Rarity } from '@prisma/client';

interface SellCard {
  id: number;
  quantity: number;
  rarity: Rarity;
  isShiny: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const cards = req.body.cards as SellCard[];
  if (!Array.isArray(cards) || cards.length === 0) {
    return res.status(400).json({ error: 'Aucune carte sélectionnée' });
  }

  try {
    // Vérifier que l'utilisateur possède bien les cartes
    const userCards = await prisma.collectedCard.findMany({
      where: {
        userId: session.user.id,
        OR: cards.map(card => ({
          cardId: card.id,
          isShiny: card.isShiny,
          quantity: {
            gte: card.quantity
          }
        }))
      }
    });

    if (userCards.length !== cards.length) {
      return res.status(400).json({ error: 'Certaines cartes ne sont pas disponibles' });
    }

    // Calculer le prix total
    const totalPrice = cards.reduce((acc, card) => {
      return acc + calculatePrice(card.rarity, card.quantity, card.isShiny);
    }, 0);

    // Mettre à jour la base de données dans une transaction
    await prisma.$transaction(async (tx) => {
      // Mettre à jour les quantités de cartes
      for (const card of cards) {
        await tx.collectedCard.update({
          where: {
            userId_cardId_isShiny: {
              userId: session.user.id,
              cardId: card.id,
              isShiny: card.isShiny
            }
          },
          data: {
            quantity: {
              decrement: card.quantity
            }
          }
        });
      }

      // Supprimer les cartes qui n'ont plus de quantité
      await tx.collectedCard.deleteMany({
        where: {
          userId: session.user.id,
          quantity: 0
        }
      });

      // Ajouter les crédits à l'utilisateur
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          credits: {
            increment: totalPrice
          }
        }
      });
    });

    return res.status(200).json({
      success: true,
      credits: totalPrice
    });
  } catch (error) {
    console.error('Erreur lors de la vente des cartes:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
} 