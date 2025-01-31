import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const { status, type = 'all' } = req.query;

    const whereClause: any = {};

    // Filtrer par statut si spécifié
    if (status) {
      whereClause.status = status;
    }

    // Filtrer par type d'échange (envoyé/reçu)
    if (type === 'sent') {
      whereClause.initiatorId = Number(session.user.id);
    } else if (type === 'received') {
      whereClause.recipientId = Number(session.user.id);
    } else {
      // Type 'all' : montrer les échanges envoyés et reçus
      whereClause.OR = [
        { initiatorId: Number(session.user.id) },
        { recipientId: Number(session.user.id) }
      ];
    }

    console.log('Session user ID:', session.user.id);
    console.log('Requête de recherche:', whereClause);

    const trades = await prisma.tradeOffer.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour séparer les cartes offertes et demandées
    const transformedTrades = trades.map(trade => ({
      ...trade,
      offeredCards: trade.cards.filter(card => card.isOffered),
      requestedCards: trade.cards.filter(card => !card.isOffered),
      cards: undefined
    }));

    console.log('Échanges trouvés:', trades.length);
    console.log('Détails des échanges:', trades.map(trade => ({
      id: trade.id,
      initiatorId: trade.initiatorId,
      recipientId: trade.recipientId,
      status: trade.status,
      initiatorUsername: trade.initiator.username,
      recipientUsername: trade.recipient.username
    })));

    // Marquer les offres expirées
    const now = new Date();
    const expiredTrades = trades.filter(trade => 
      trade.status === 'PENDING' && new Date(trade.expiresAt) < now
    );

    if (expiredTrades.length > 0) {
      await prisma.tradeOffer.updateMany({
        where: {
          id: {
            in: expiredTrades.map(trade => trade.id)
          }
        },
        data: {
          status: 'EXPIRED'
        }
      });

      // Mettre à jour le statut dans la réponse
      expiredTrades.forEach(trade => {
        trade.status = 'EXPIRED';
      });
    }

    res.status(200).json(transformedTrades);
  } catch (error) {
    console.error('Erreur lors de la récupération des échanges:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des échanges' });
  }
} 