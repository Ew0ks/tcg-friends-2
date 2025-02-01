import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
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

    const { userId, amount, operation } = req.body;

    if (operation === 'update') {
      // Vérifier que le montant est un nombre valide
      if (isNaN(amount) || amount < 0) {
        return res.status(400).json({ message: 'Montant invalide' });
      }

      // Mettre à jour les crédits d'un utilisateur spécifique
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { credits: amount },
        select: { id: true, username: true, credits: true },
      });

      return res.status(200).json({
        message: `Crédits mis à jour pour ${updatedUser.username}`,
        user: updatedUser,
      });
    } else if (operation === 'bulk') {
      // Vérifier que le montant est un nombre valide
      if (isNaN(amount)) {
        return res.status(400).json({ message: 'Montant invalide' });
      }

      // Mettre à jour les crédits de tous les utilisateurs
      const updatedUsers = await prisma.user.updateMany({
        data: {
          credits: {
            [amount > 0 ? 'increment' : 'decrement']: Math.abs(amount),
          },
        },
      });

      // S'assurer qu'aucun utilisateur n'a un solde négatif
      await prisma.user.updateMany({
        where: {
          credits: { lt: 0 },
        },
        data: { credits: 0 },
      });

      return res.status(200).json({
        message: `Crédits mis à jour pour ${updatedUsers.count} utilisateurs`,
        count: updatedUsers.count,
      });
    }

    return res.status(400).json({ message: 'Opération invalide' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des crédits:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 