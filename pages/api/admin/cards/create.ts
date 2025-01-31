import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { uploadImage } from '@/lib/cloudinary';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    console.log('User:', user);

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { name, description, quote, power, rarity, imageBase64 } = req.body;
    console.log('Données reçues:', { name, description, quote, power, rarity, hasImage: !!imageBase64 });

    // Validation des données
    if (!name || !description || !power || !rarity || !imageBase64) {
      return res.status(400).json({ 
        message: 'Données manquantes',
        details: {
          name: !name,
          description: !description,
          power: !power,
          rarity: !rarity,
          imageBase64: !imageBase64
        }
      });
    }

    try {
      // Upload de l'image sur Cloudinary
      console.log('Début upload Cloudinary');
      const imageUrl = await uploadImage(imageBase64);
      console.log('Image uploadée:', imageUrl);

      // Création de la carte
      const card = await prisma.card.create({
        data: {
          name,
          description,
          quote,
          power: parseInt(power),
          rarity,
          imageUrl,
        },
      });
      console.log('Carte créée:', card);

      return res.status(201).json(card);
    } catch (uploadError) {
      console.error('Erreur détaillée:', uploadError);
      return res.status(500).json({ 
        message: 'Erreur lors de l\'upload ou de la création',
        error: uploadError.message
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de la carte:', error);
    return res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
} 