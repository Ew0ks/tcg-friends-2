import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, BoosterType } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const boosters = await prisma.boosterConfig.findMany({
      orderBy: {
        cost: 'asc'
      }
    });

    // Ajouter les descriptions pour chaque type de booster
    const boostersWithDescription = boosters.map(booster => ({
      ...booster,
      description: getBoosterDescription(booster.type)
    }));

    console.log('Sending boosters:', boostersWithDescription); // Debug
    res.status(200).json(boostersWithDescription);
  } catch (error) {
    console.error('Error fetching boosters:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des boosters' });
  }
}

function getBoosterDescription(type: BoosterType): string {
  switch (type) {
    case BoosterType.STANDARD:
      return '4 cartes dont au moins une peu commune';
    case BoosterType.RARE:
      return '4 cartes dont au moins une rare';
    case BoosterType.EPIC:
      return '1 carte épique ou légendaire garantie';
    case BoosterType.MAXI:
      return '8 cartes dont au moins une rare';
    default:
      return '';
  }
} 