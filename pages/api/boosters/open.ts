import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Rarity } from '@prisma/client';
import type { BoosterType } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Définir les headers de réponse dès le début
    res.setHeader('Content-Type', 'application/json');
    console.log('Booster open request received');

    // Vérifier la méthode
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      return res.status(405).json({ 
        message: `Method ${req.method} Not Allowed`,
        error: 'Invalid method'
      });
    }

    // Vérifier le body
    if (!req.body) {
      console.log('No request body');
      return res.status(400).json({
        message: 'Request body is required',
        error: 'No body'
      });
    }

    console.log('Request payload:', req.body);
    const { type, userId } = req.body;

    // Vérifier les champs requis
    if (!type || !userId) {
      console.log('Missing required fields:', { type, userId });
      return res.status(400).json({
        message: 'Type de booster et ID utilisateur requis',
        received: { type, userId }
      });
    }

    // Convertir userId en nombre si ce n'est pas déjà le cas
    const userIdNumber = parseInt(userId, 10);
    if (isNaN(userIdNumber)) {
      return res.status(400).json({ 
        message: 'ID utilisateur invalide',
        received: userId
      });
    }

    console.log('Opening booster:', { type, userId: userIdNumber });

    // Vérifier le booster et l'utilisateur
    const [boosterConfig, user] = await Promise.all([
      prisma.boosterConfig.findUnique({ where: { type } }),
      prisma.user.findUnique({ where: { id: userIdNumber } })
    ]);

    console.log('Booster config:', boosterConfig);
    console.log('User found:', user);

    if (!boosterConfig) {
      return res.status(400).json({ message: 'Type de booster invalide' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.credits < boosterConfig.cost) {
      return res.status(400).json({ message: 'Crédits insuffisants' });
    }

    // Générer les cartes
    const generatedCards = await generateBoosterCards(type);
    console.log('Generated cards:', generatedCards);

    if (!generatedCards || generatedCards.length === 0) {
      throw new Error('Aucune carte générée');
    }

    // Créer l'achat et mettre à jour la collection dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'achat du booster
      const purchase = await tx.boosterPurchase.create({
        data: {
          userId: userIdNumber,
          type,
          cost: boosterConfig.cost,
        },
      });

      // 2. Créer les cartes du booster
      const boosterCards = await Promise.all(
        generatedCards.map(card => 
          tx.cardFromBooster.create({
            data: {
              boosterId: purchase.id,
              cardId: card.id,
              isShiny: card.isShiny,
            },
          })
        )
      );

      // 3. Mettre à jour les statistiques de l'utilisateur
      await tx.user.update({
        where: { id: userIdNumber },
        data: {
          credits: user.credits - boosterConfig.cost,
          totalBoostersOpened: { increment: 1 },
          legendaryCardsFound: {
            increment: generatedCards.filter(c => c.rarity === 'LEGENDARY').length,
          },
          shinyCardsFound: {
            increment: generatedCards.filter(c => c.isShiny).length,
          },
        },
      });

      // 4. Mettre à jour la collection
      await Promise.all(
        generatedCards.map(card => 
          tx.collectedCard.upsert({
            where: {
              userId_cardId_isShiny: {
                userId: userIdNumber,
                cardId: card.id,
                isShiny: card.isShiny,
              },
            },
            update: {
              quantity: { increment: 1 },
            },
            create: {
              userId: userIdNumber,
              cardId: card.id,
              isShiny: card.isShiny,
              quantity: 1,
            },
          })
        )
      );

      // Retourner l'achat avec les cartes
      return tx.boosterPurchase.findUnique({
        where: { id: purchase.id },
        include: {
          cards: {
            include: {
              card: true,
            },
          },
        },
      });
    });

    console.log('Transaction completed, sending response');

    // Log avant de renvoyer la réponse
    console.log('Sending response:', {
      boosterPurchase: result,
      cards: result?.cards || [],
    });

    return res.status(200).json({
      boosterPurchase: result,
      cards: result?.cards || [],
    });

  } catch (error) {
    console.error('Full error:', error);
    // S'assurer que la réponse n'a pas déjà été envoyée
    if (!res.headersSent) {
      return res.status(500).json({
        message: 'Erreur lors de l\'ouverture du booster',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

interface GeneratedCard {
  id: number;
  rarity: Rarity;
  isShiny: boolean;
}

async function generateBoosterCards(type: BoosterType): Promise<GeneratedCard[]> {
  console.log('Starting booster opening for type:', type);
  
  const SHINY_CHANCE = 0.05;

  // Obtenir la configuration du booster
  const boosterConfig = await prisma.boosterConfig.findUnique({
    where: { type },
    select: {
      cardCount: true,
    },
  });

  if (!boosterConfig) {
    throw new Error('Invalid booster type');
  }

  // Déterminer la rareté garantie
  let guaranteedRarity: Rarity;
  switch (type) {
    case 'LEGENDARY':
      guaranteedRarity = 'LEGENDARY';
      break;
    case 'RARE':
      guaranteedRarity = 'RARE';
      break;
    case 'STANDARD':
      guaranteedRarity = 'UNCOMMON';
      break;
    default:
      throw new Error('Invalid booster type');
  }

  // Récupérer la carte garantie
  const cards = await prisma.card.findMany({
    where: {
      rarity: guaranteedRarity,
    },
    select: {
      id: true,
      rarity: true,
      name: true,
      description: true,
      quote: true,
      power: true,
    },
  });

  if (!cards || cards.length === 0) {
    throw new Error(`No card found with rarity ${guaranteedRarity}`);
  }

  // Sélectionner une carte aléatoire
  const guaranteedCard = cards[Math.floor(Math.random() * cards.length)];

  const result: GeneratedCard[] = [{
    id: guaranteedCard.id,
    rarity: guaranteedCard.rarity,
    isShiny: Math.random() < SHINY_CHANCE,
  }];

  // Remplir le reste du booster
  const remainingCount = boosterConfig.cardCount - 1;

  for (let i = 0; i < remainingCount; i++) {
    const roll = Math.random();
    let targetRarity: Rarity;
    
    if (roll < 0.01) { // 1% légendaire
      targetRarity = 'LEGENDARY';
    } else if (roll < 0.15) { // 14% rare
      targetRarity = 'RARE';
    } else if (roll < 0.40) { // 25% peu commune
      targetRarity = 'UNCOMMON';
    } else { // 60% commune
      targetRarity = 'COMMON';
    }

    // Récupérer une carte aléatoire de la rareté ciblée
    const randomCard = await prisma.card.findFirst({
      where: {
        rarity: targetRarity,
      },
      select: {
        id: true,
        rarity: true,
        name: true,
        description: true,
        quote: true,
        power: true,
      },
      // Ordre aléatoire pour la sélection
      orderBy: {
        id: 'asc', // ou tout autre champ, puisque nous prenons le premier
      },
      skip: Math.floor(Math.random() * await prisma.card.count({
        where: { rarity: targetRarity }
      })),
    });

    if (randomCard) {
      result.push({
        id: randomCard.id,
        rarity: randomCard.rarity,
        isShiny: Math.random() < SHINY_CHANCE,
      });
    } else {
      // Fallback sur une carte commune si la rareté souhaitée n'est pas disponible
      const commonCard = await prisma.card.findFirst({
        where: {
          rarity: 'COMMON',
        },
        select: {
          id: true,
          rarity: true,
        },
      });

      if (!commonCard) {
        throw new Error('No cards available');
      }

      result.push({
        id: commonCard.id,
        rarity: commonCard.rarity,
        isShiny: Math.random() < SHINY_CHANCE,
      });
    }
  }

  console.log('Selected cards:', result);
  return result;
} 