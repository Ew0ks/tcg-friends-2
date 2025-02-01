import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Rarity } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import { uploadImage } from '@/lib/cloudinary';

const prisma = new PrismaClient();

interface UpdateCardData {
  name: string;
  description: string;
  quote?: string | null;
  power: number;
  rarity: Rarity;
  setId: number;
  imageUrl?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    const { id } = req.query;
    const cardId = parseInt(id as string);
    const { name, description, quote, power, rarity, imageBase64, setId } = req.body;

    // Vérifier si la carte existe
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return res.status(404).json({ message: 'Carte non trouvée' });
    }

    // Préparer les données de mise à jour
    const updateData: UpdateCardData = {
      name,
      description,
      quote,
      power: parseInt(power),
      rarity,
      setId: parseInt(setId),
    };

    // Si une nouvelle image est fournie, la télécharger
    if (imageBase64) {
      const imageUrl = await uploadImage(imageBase64);
      updateData.imageUrl = imageUrl;
    }

    // Mettre à jour la carte
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: updateData,
    });

    return res.status(200).json(updatedCard);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 