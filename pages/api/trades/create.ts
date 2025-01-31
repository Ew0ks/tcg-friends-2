import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const { recipientId, offeredCards, requestedCards, message } = req.body;
    const initiatorId = Number(session.user.id);
    const recipientIdNumber = Number(recipientId);

    // Vérifier que l'initiateur n'essaie pas d'échanger avec lui-même
    if (initiatorId === recipientIdNumber) {
      return res.status(400).json({ message: 'Vous ne pouvez pas échanger avec vous-même' });
    }
    
    console.log('Création d\'échange - Données reçues:', {
      initiatorId,
      recipientId: recipientIdNumber,
      offeredCards,
      requestedCards,
      message
    });

    // Vérifier que l'initiateur possède les cartes offertes
    const userCards = await prisma.collectedCard.findMany({
      where: {
        userId: initiatorId,
        OR: offeredCards.map((card: { cardId: number, isShiny: boolean, quantity: number }) => ({
          cardId: card.cardId,
          isShiny: card.isShiny,
          quantity: {
            gte: card.quantity
          }
        }))
      }
    });

    console.log('Cartes trouvées pour l\'initiateur:', userCards.length);

    if (userCards.length !== offeredCards.length) {
      return res.status(400).json({ message: 'Vous ne possédez pas toutes les cartes offertes' });
    }

    // Vérifier que le destinataire possède les cartes demandées
    const recipientCards = await prisma.collectedCard.findMany({
      where: {
        userId: recipientIdNumber,
        OR: requestedCards.map((card: { cardId: number, isShiny: boolean, quantity: number }) => ({
          cardId: card.cardId,
          isShiny: card.isShiny,
          quantity: {
            gte: card.quantity
          }
        }))
      }
    });

    console.log('Cartes trouvées pour le destinataire:', recipientCards.length);

    if (recipientCards.length !== requestedCards.length) {
      return res.status(400).json({ message: 'Le destinataire ne possède pas toutes les cartes demandées' });
    }

    // Créer l'offre d'échange
    const tradeOffer = await prisma.tradeOffer.create({
      data: {
        initiatorId,
        recipientId: recipientIdNumber,
        message,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expire dans 24h
        cards: {
          create: [
            ...offeredCards.map((card: { cardId: number, isShiny: boolean, quantity: number }) => ({
              cardId: card.cardId,
              isShiny: card.isShiny,
              quantity: card.quantity,
              isOffered: true
            })),
            ...requestedCards.map((card: { cardId: number, isShiny: boolean, quantity: number }) => ({
              cardId: card.cardId,
              isShiny: card.isShiny,
              quantity: card.quantity,
              isOffered: false
            }))
          ]
        }
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true
          }
        },
        recipient: {
          select: {
            id: true,
            username: true
          }
        },
        cards: {
          include: {
            card: true
          }
        }
      }
    });

    console.log('Échange créé avec succès:', {
      id: tradeOffer.id,
      initiatorId: tradeOffer.initiatorId,
      recipientId: tradeOffer.recipientId,
      initiatorUsername: tradeOffer.initiator.username,
      recipientUsername: tradeOffer.recipient.username
    });

    res.status(200).json(tradeOffer);
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre d\'échange:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'offre d\'échange' });
  }
} 