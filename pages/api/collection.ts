import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Logique pour récupérer les cartes collectées
    const collectedCards = await prisma.collectedCard.findMany({
      include: {
        card: true, // Inclure les détails de la carte
      },
    });

    res.status(200).json(collectedCards);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 