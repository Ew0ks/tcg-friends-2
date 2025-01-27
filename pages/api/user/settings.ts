import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  // GET - Récupérer les paramètres
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isPublic: true }
      });

      return res.status(200).json({ isPublic: user?.isPublic ?? false });
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // PUT - Mettre à jour les paramètres
  if (req.method === 'PUT') {
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ error: 'Paramètres invalides' });
    }

    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { isPublic }
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
} 