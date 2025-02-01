import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  if (req.method === 'GET') {
    try {
      const settings = await prisma.gameSettings.findMany();
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { key, value } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({ message: 'Paramètres manquants' });
      }

      const updatedSetting = await prisma.gameSettings.upsert({
        where: { key },
        update: { value: value.toString() },
        create: {
          key,
          value: value.toString(),
          description: req.body.description,
        },
      });

      return res.status(200).json(updatedSetting);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
} 