import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';
import { TradeStatus } from '@prisma/client';
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
    const { tradeOfferId, accept } = req.body;
    console.log('Données reçues:', { tradeOfferId, accept, userId: session.user.id });

    if (tradeOfferId === undefined || accept === undefined) {
      return res.status(400).json({ message: 'Paramètres manquants' });
    }

    // Récupérer l'offre d'échange
    const tradeOffer = await prisma.tradeOffer.findUnique({
      where: { id: Number(tradeOfferId) },
      include: {
        cards: true,
        initiator: {
          select: { username: true }
        },
        recipient: {
          select: { username: true }
        }
      }
    });

    console.log('Offre trouvée:', tradeOffer);

    if (!tradeOffer) {
      return res.status(404).json({ message: 'Offre d\'échange non trouvée' });
    }

    if (tradeOffer.recipientId !== session.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas le destinataire de cette offre' });
    }

    if (tradeOffer.status !== TradeStatus.PENDING) {
      return res.status(400).json({ message: 'Cette offre n\'est plus en attente' });
    }

    if (new Date() > tradeOffer.expiresAt) {
      await prisma.tradeOffer.update({
        where: { id: Number(tradeOfferId) },
        data: { status: TradeStatus.EXPIRED }
      });
      return res.status(400).json({ message: 'Cette offre a expiré' });
    }

    if (!accept) {
      // Rejeter l'offre
      const rejectedTrade = await prisma.tradeOffer.update({
        where: { id: Number(tradeOfferId) },
        data: { status: TradeStatus.REJECTED }
      });
      console.log('Offre rejetée:', rejectedTrade);
      return res.status(200).json({ message: 'Offre rejetée' });
    }

    // Vérifier que les cartes sont toujours disponibles
    const offeredCards = tradeOffer.cards.filter(card => card.isOffered);
    const requestedCards = tradeOffer.cards.filter(card => !card.isOffered);

    const initiatorCards = await prisma.collectedCard.findMany({
      where: {
        userId: tradeOffer.initiatorId,
        OR: offeredCards.map(card => ({
          cardId: card.cardId,
          isShiny: card.isShiny,
          quantity: {
            gte: card.quantity
          }
        }))
      }
    });

    const recipientCards = await prisma.collectedCard.findMany({
      where: {
        userId: tradeOffer.recipientId,
        OR: requestedCards.map(card => ({
          cardId: card.cardId,
          isShiny: card.isShiny,
          quantity: {
            gte: card.quantity
          }
        }))
      }
    });

    console.log('Vérification des cartes:', {
      initiatorCardsFound: initiatorCards.length,
      offeredCardsCount: offeredCards.length,
      recipientCardsFound: recipientCards.length,
      requestedCardsCount: requestedCards.length
    });

    if (initiatorCards.length !== offeredCards.length || 
        recipientCards.length !== requestedCards.length) {
      await prisma.tradeOffer.update({
        where: { id: Number(tradeOfferId) },
        data: { status: TradeStatus.CANCELLED }
      });
      return res.status(400).json({ message: 'Les cartes ne sont plus disponibles' });
    }

    // Effectuer l'échange dans une transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Transférer les cartes offertes
      for (const card of offeredCards) {
        await prisma.collectedCard.updateMany({
          where: {
            userId: tradeOffer.initiatorId,
            cardId: card.cardId,
            isShiny: card.isShiny,
          },
          data: {
            quantity: {
              decrement: card.quantity
            }
          }
        });

        const existingRecipientCard = await prisma.collectedCard.findFirst({
          where: {
            userId: tradeOffer.recipientId,
            cardId: card.cardId,
            isShiny: card.isShiny,
          }
        });

        if (existingRecipientCard) {
          await prisma.collectedCard.update({
            where: { id: existingRecipientCard.id },
            data: {
              quantity: {
                increment: card.quantity
              }
            }
          });
        } else {
          await prisma.collectedCard.create({
            data: {
              userId: tradeOffer.recipientId,
              cardId: card.cardId,
              isShiny: card.isShiny,
              quantity: card.quantity,
              isNew: true
            }
          });
        }
      }

      // Transférer les cartes demandées
      for (const card of requestedCards) {
        await prisma.collectedCard.updateMany({
          where: {
            userId: tradeOffer.recipientId,
            cardId: card.cardId,
            isShiny: card.isShiny,
          },
          data: {
            quantity: {
              decrement: card.quantity
            }
          }
        });

        const existingInitiatorCard = await prisma.collectedCard.findFirst({
          where: {
            userId: tradeOffer.initiatorId,
            cardId: card.cardId,
            isShiny: card.isShiny,
          }
        });

        if (existingInitiatorCard) {
          await prisma.collectedCard.update({
            where: { id: existingInitiatorCard.id },
            data: {
              quantity: {
                increment: card.quantity
              }
            }
          });
        } else {
          await prisma.collectedCard.create({
            data: {
              userId: tradeOffer.initiatorId,
              cardId: card.cardId,
              isShiny: card.isShiny,
              quantity: card.quantity,
              isNew: true
            }
          });
        }
      }

      // Mettre à jour le statut de l'offre
      return await prisma.tradeOffer.update({
        where: { id: Number(tradeOfferId) },
        data: { status: TradeStatus.ACCEPTED }
      });
    });

    console.log('Échange effectué avec succès:', result);

    res.status(200).json({ message: 'Échange effectué avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réponse à l\'offre d\'échange:', error);
    res.status(500).json({ message: 'Erreur lors de la réponse à l\'offre d\'échange' });
  }
} 