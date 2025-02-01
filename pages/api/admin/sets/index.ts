import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Récupérer tous les sets
    const sets = await prisma.set.findMany({
      orderBy: {
        releaseDate: 'desc'
      }
    });

    return res.status(200).json(sets);
  } catch (error) {
    console.error('Erreur lors de la récupération des sets:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 