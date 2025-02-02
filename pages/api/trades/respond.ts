import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';
import { TradeStatus } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]';

async function logCollection(userId: number, message: string) {
  const collection = await prisma.collectedCard.findMany({
    where: { userId },
    include: { card: true }
  });
  console.log(`${message}:`, {
    userId,
    cards: collection.map(c => ({
      cardId: c.cardId,
      cardName: c.card.name,
      quantity: c.quantity,
      isShiny: c.isShiny
    }))
  });
}

async function verifyCardAvailability(userId: number, cardId: number, isShiny: boolean, requiredQuantity: number): Promise<boolean> {
  const card = await prisma.collectedCard.findFirst({
    where: {
      userId,
      cardId,
      isShiny,
    }
  });

  return card !== null && card.quantity >= requiredQuantity;
}

async function transferCard(
  tx: any,
  fromUserId: number,
  toUserId: number,
  cardId: number,
  isShiny: boolean,
  quantity: number,
  cardName: string
) {
  // 1. Vérifier et retirer les cartes du donneur
  const fromCard = await tx.collectedCard.findFirst({
    where: {
      userId: fromUserId,
      cardId,
      isShiny,
    }
  });

  if (!fromCard || fromCard.quantity < quantity) {
    throw new Error(`Quantité insuffisante pour la carte ${cardName}`);
  }

  // 2. Mettre à jour ou supprimer la carte du donneur
  if (fromCard.quantity === quantity) {
    // Si toutes les cartes sont transférées, supprimer l'entrée
    await tx.collectedCard.delete({
      where: { id: fromCard.id }
    });
    console.log(`📤 Suppression complète de la carte pour l'utilisateur ${fromUserId}:`, {
      cardId,
      cardName,
      isShiny
    });
  } else {
    // Sinon, décrémenter la quantité
    await tx.collectedCard.update({
      where: { id: fromCard.id },
      data: {
        quantity: {
          decrement: quantity
        }
      }
    });
    console.log(`📤 Décrémentation de ${quantity} cartes pour l'utilisateur ${fromUserId}:`, {
      cardId,
      cardName,
      isShiny,
      newQuantity: fromCard.quantity - quantity
    });
  }

  // 3. Ajouter ou mettre à jour pour le receveur
  const toCard = await tx.collectedCard.findFirst({
    where: {
      userId: toUserId,
      cardId,
      isShiny,
    }
  });

  if (toCard) {
    // Mettre à jour la quantité existante
    await tx.collectedCard.update({
      where: { id: toCard.id },
      data: {
        quantity: {
          increment: quantity
        }
      }
    });
    console.log(`📥 Incrémentation de ${quantity} cartes pour l'utilisateur ${toUserId}:`, {
      cardId,
      cardName,
      isShiny,
      newQuantity: toCard.quantity + quantity
    });
  } else {
    // Créer une nouvelle entrée
    await tx.collectedCard.create({
      data: {
        userId: toUserId,
        cardId,
        isShiny,
        quantity,
        isNew: true
      }
    });
    console.log(`📥 Création d'une nouvelle entrée pour l'utilisateur ${toUserId}:`, {
      cardId,
      cardName,
      isShiny,
      quantity
    });
  }
}

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
    console.log('🚀 Début du traitement - Données reçues:', { tradeOfferId, accept, userId: session.user.id });

    if (tradeOfferId === undefined || accept === undefined) {
      console.log('❌ Paramètres manquants');
      return res.status(400).json({ message: 'Paramètres manquants' });
    }

    // Récupérer l'offre d'échange
    const tradeOffer = await prisma.tradeOffer.findUnique({
      where: { id: Number(tradeOfferId) },
      include: {
        cards: {
          include: {
            card: true
          }
        },
        initiator: true,
        recipient: true
      }
    });

    console.log('📦 Offre trouvée:', JSON.stringify(tradeOffer, null, 2));

    if (!tradeOffer) {
      console.log('❌ Offre non trouvée');
      return res.status(404).json({ message: 'Offre d\'échange non trouvée' });
    }

    // Log des collections initiales
    await logCollection(tradeOffer.initiatorId, '📊 Collection initiale de l\'initiateur');
    await logCollection(tradeOffer.recipientId, '📊 Collection initiale du destinataire');

    if (!accept) {
      console.log('🚫 Rejet de l\'offre');
      await prisma.tradeOffer.update({
        where: { id: Number(tradeOfferId) },
        data: { status: TradeStatus.REJECTED }
      });
      return res.status(200).json({ message: 'Offre rejetée' });
    }

    // Vérifier que les cartes sont toujours disponibles
    const offeredCards = tradeOffer.cards.filter(card => card.isOffered);
    const requestedCards = tradeOffer.cards.filter(card => !card.isOffered);

    // Vérifier la disponibilité des cartes avant l'échange
    for (const card of offeredCards) {
      const isAvailable = await verifyCardAvailability(
        tradeOffer.initiatorId,
        card.cardId,
        card.isShiny,
        card.quantity
      );
      if (!isAvailable) {
        console.log('❌ Carte non disponible:', {
          cardId: card.cardId,
          cardName: card.card.name,
          quantity: card.quantity,
          isShiny: card.isShiny,
          userId: tradeOffer.initiatorId
        });
        await prisma.tradeOffer.update({
          where: { id: Number(tradeOfferId) },
          data: { status: TradeStatus.CANCELLED }
        });
        return res.status(400).json({ 
          message: `L'initiateur ne possède plus assez d'exemplaires de la carte ${card.card.name}`
        });
      }
    }

    for (const card of requestedCards) {
      const isAvailable = await verifyCardAvailability(
        tradeOffer.recipientId,
        card.cardId,
        card.isShiny,
        card.quantity
      );
      if (!isAvailable) {
        console.log('❌ Carte non disponible:', {
          cardId: card.cardId,
          cardName: card.card.name,
          quantity: card.quantity,
          isShiny: card.isShiny,
          userId: tradeOffer.recipientId
        });
        await prisma.tradeOffer.update({
          where: { id: Number(tradeOfferId) },
          data: { status: TradeStatus.CANCELLED }
        });
        return res.status(400).json({ 
          message: `Le destinataire ne possède plus assez d'exemplaires de la carte ${card.card.name}`
        });
      }
    }

    console.log('🔄 Cartes à échanger:', {
      offered: offeredCards.map(c => ({
        cardId: c.cardId,
        cardName: c.card.name,
        quantity: c.quantity,
        isShiny: c.isShiny
      })),
      requested: requestedCards.map(c => ({
        cardId: c.cardId,
        cardName: c.card.name,
        quantity: c.quantity,
        isShiny: c.isShiny
      }))
    });

    // Effectuer l'échange dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log('🏁 Début de la transaction');

      // Transférer les cartes offertes (de l'initiateur au destinataire)
      for (const card of offeredCards) {
        console.log(`\n🔄 Traitement de la carte ${card.card.name} (ID: ${card.cardId})`);
        await transferCard(
          tx,
          tradeOffer.initiatorId,
          tradeOffer.recipientId,
          card.cardId,
          card.isShiny,
          card.quantity,
          card.card.name
        );
      }

      // Transférer les cartes demandées (du destinataire à l'initiateur)
      for (const card of requestedCards) {
        console.log(`\n🔄 Traitement de la carte ${card.card.name} (ID: ${card.cardId})`);
        await transferCard(
          tx,
          tradeOffer.recipientId,
          tradeOffer.initiatorId,
          card.cardId,
          card.isShiny,
          card.quantity,
          card.card.name
        );
      }

      // Mettre à jour le statut de l'offre
      console.log('✅ Finalisation de l\'échange');
      return await tx.tradeOffer.update({
        where: { id: Number(tradeOfferId) },
        data: { status: TradeStatus.ACCEPTED }
      });
    });

    // Log des collections finales
    await logCollection(tradeOffer.initiatorId, '📊 Collection finale de l\'initiateur');
    await logCollection(tradeOffer.recipientId, '📊 Collection finale du destinataire');

    console.log('✅ Échange terminé avec succès:', {
      tradeId: result.id,
      status: result.status
    });

    res.status(200).json({ message: 'Échange effectué avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de l\'échange:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Erreur lors de la réponse à l\'offre d\'échange'
    });
  }
} 