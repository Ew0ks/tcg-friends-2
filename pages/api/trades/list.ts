import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const session = await getSession({ req });
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
      whereClause.initiatorId = session.user.id;
    } else if (type === 'received') {
      whereClause.recipientId = session.user.id;
    } else {
      // Type 'all' : montrer les échanges envoyés et reçus
      whereClause.OR = [
        { initiatorId: session.user.id },
        { recipientId: session.user.id }
      ];
    }

    console.log('Requête de recherche:', whereClause); // Pour le débogage

    const trades = await prisma.tradeOffer.findMany({
      where: whereClause,
      include: {
        initiator: {
          select: {
            username: true
          }
        },
        recipient: {
          select: {
            username: true
          }
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Échanges trouvés:', trades.length); // Pour le débogage

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

    res.status(200).json(trades);
  } catch (error) {
    console.error('Erreur lors de la récupération des échanges:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des échanges' });
  }
} 