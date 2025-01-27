import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';
import { TradeStatus } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const session = await getSession({ req });
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const { recipientId, offeredCards, requestedCards, message } = req.body;
    
    console.log('Création d\'échange - Données reçues:', {
      initiatorId: session.user.id,
      recipientId,
      offeredCards,
      requestedCards,
      message
    });

    // Vérifier que l'initiateur possède les cartes offertes
    const userCards = await prisma.collectedCard.findMany({
      where: {
        userId: session.user.id,
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
        userId: recipientId,
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
        initiatorId: session.user.id,
        recipientId: Number(recipientId), // S'assurer que recipientId est un nombre
        message,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expire dans 24h
        offeredCards: {
          create: offeredCards.map((card: { cardId: number, isShiny: boolean, quantity: number }) => ({
            cardId: card.cardId,
            isShiny: card.isShiny,
            quantity: card.quantity,
            isOffered: true
          }))
        },
        requestedCards: {
          create: requestedCards.map((card: { cardId: number, isShiny: boolean, quantity: number }) => ({
            cardId: card.cardId,
            isShiny: card.isShiny,
            quantity: card.quantity,
            isOffered: false
          }))
        }
      },
      include: {
        offeredCards: {
          include: {
            card: true
          }
        },
        requestedCards: {
          include: {
            card: true
          }
        }
      }
    });

    console.log('Échange créé avec succès:', tradeOffer.id);

    // TODO: Envoyer une notification au destinataire

    res.status(200).json(tradeOffer);
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre d\'échange:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'offre d\'échange' });
  }
} 