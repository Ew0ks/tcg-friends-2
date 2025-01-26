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

    console.log(JSON.stringify(session), "session");
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log(JSON.stringify(user), "user admin");

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Récupérer tous les utilisateurs avec leurs statistiques
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        credits: true,
        totalBoostersOpened: true,
        legendaryCardsFound: true,
        shinyCardsFound: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 