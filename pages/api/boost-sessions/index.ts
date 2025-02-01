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

  if (req.method === 'GET') {
    try {
      const boostSessions = await prisma.boostSession.findMany({
        orderBy: { startDate: 'desc' },
      });
      return res.status(200).json(boostSessions);
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions de boost:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
      }

      const boostSession = await prisma.boostSession.create({
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          active: true,
        },
      });

      return res.status(201).json(boostSession);
    } catch (error) {
      console.error('Erreur lors de la création de la session de boost:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 