import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const { userId, role } = req.body;

    if (!userId || !role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Données invalides' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 