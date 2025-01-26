import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Vérifier que l'utilisateur est admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { userId, role } = req.body;

    if (!userId || !role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Empêcher un admin de se rétrograder lui-même
    if (userId === admin.id && role !== 'ADMIN') {
      return res.status(400).json({ message: 'Un administrateur ne peut pas se rétrograder lui-même' });
    }

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json({ message: 'Rôle mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 