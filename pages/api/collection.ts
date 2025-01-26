import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    // Récupérer uniquement les cartes de l'utilisateur connecté
    const collectedCards = await prisma.collectedCard.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        card: true
      },
      orderBy: [
        { card: { rarity: 'desc' } },
        { isShiny: 'desc' },
        { card: { name: 'asc' } }
      ]
    });

    return res.status(200).json(collectedCards);
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 