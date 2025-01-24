import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Logique pour ouvrir un booster
    // Exemple : générer des cartes aléatoires
    const cards = await prisma.card.findMany(); // Récupérer toutes les cartes
    const randomCards = cards.sort(() => 0.5 - Math.random()).slice(0, 5); // Prendre 5 cartes aléatoires

    res.status(200).json(randomCards);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 