import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import { UserRole } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  if (req.method === 'GET') {
    try {
      const { sort, order } = req.query;

      let orderBy = {};

      // Configuration du tri
      if (sort && order) {
        switch (sort) {
          case 'name':
          case 'rarity':
          case 'power':
            orderBy = {
              [sort]: order === 'asc' ? 'asc' : 'desc'
            };
            break;
          default:
            orderBy = { id: 'asc' }; // Tri par défaut
        }
      } else {
        orderBy = { id: 'asc' }; // Tri par défaut
      }

      const cards = await prisma.card.findMany({
        orderBy,
      });

      return res.status(200).json(cards);
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des cartes' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
} 