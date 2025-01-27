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
    const { tradeOfferId, accept } = req.body;

    // Récupérer l'offre d'échange
    const tradeOffer = await prisma.tradeOffer.findUnique({
      where: { id: tradeOfferId },
      include: {
        offeredCards: true,
        requestedCards: true,
      },
    });

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
        where: { id: tradeOfferId },
        data: { status: TradeStatus.EXPIRED }
      });
      return res.status(400).json({ message: 'Cette offre a expiré' });
    }

    if (!accept) {
      // Rejeter l'offre
      await prisma.tradeOffer.update({
        where: { id: tradeOfferId },
        data: { status: TradeStatus.REJECTED }
      });
      return res.status(200).json({ message: 'Offre rejetée' });
    }

    // Vérifier que les cartes sont toujours disponibles
    const initiatorCards = await prisma.collectedCard.findMany({
      where: {
        userId: tradeOffer.initiatorId,
        OR: tradeOffer.offeredCards.map(card => ({
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
        OR: tradeOffer.requestedCards.map(card => ({
          cardId: card.cardId,
          isShiny: card.isShiny,
          quantity: {
            gte: card.quantity
          }
        }))
      }
    });

    if (initiatorCards.length !== tradeOffer.offeredCards.length || 
        recipientCards.length !== tradeOffer.requestedCards.length) {
      await prisma.tradeOffer.update({
        where: { id: tradeOfferId },
        data: { status: TradeStatus.CANCELLED }
      });
      return res.status(400).json({ message: 'Les cartes ne sont plus disponibles' });
    }

    // Effectuer l'échange dans une transaction
    await prisma.$transaction(async (prisma) => {
      // Transférer les cartes offertes
      for (const card of tradeOffer.offeredCards) {
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
      for (const card of tradeOffer.requestedCards) {
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
      await prisma.tradeOffer.update({
        where: { id: tradeOfferId },
        data: { status: TradeStatus.ACCEPTED }
      });
    });

    // TODO: Envoyer une notification à l'initiateur

    res.status(200).json({ message: 'Échange effectué avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réponse à l\'offre d\'échange:', error);
    res.status(500).json({ message: 'Erreur lors de la réponse à l\'offre d\'échange' });
  }
} 