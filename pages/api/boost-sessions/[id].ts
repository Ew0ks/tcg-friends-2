import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  // Vérifier que l'utilisateur est admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const { id } = req.query;
  const boostSessionId = parseInt(id as string, 10);

  if (req.method === 'DELETE') {
    try {
      await prisma.boostSession.delete({
        where: { id: boostSessionId },
      });
      return res.status(200).json({ message: 'Session de boost supprimée' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la session de boost:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { active } = req.body;
      
      const boostSession = await prisma.boostSession.update({
        where: { id: boostSessionId },
        data: { active },
      });

      return res.status(200).json(boostSession);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session de boost:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  res.setHeader('Allow', ['DELETE', 'PATCH']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 