import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    console.log('Utilisateur non authentifié');
    return res.status(401).json({ message: 'Non authentifié' });
  }

  try {
    const now = new Date();
    console.log('Vérification des boosts à:', now);
    
    const activeBoost = await prisma.boostSession.findFirst({
      where: {
        AND: [
          { active: true },
          { startDate: { lte: now } },
          { endDate: { gte: now } },
        ],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        message: true,
      },
    });

    console.log('Boost trouvé:', activeBoost);

    const response = {
      active: !!activeBoost,
      message: activeBoost?.message || '',
    };

    console.log('Réponse envoyée:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Erreur lors de la vérification du boost:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 