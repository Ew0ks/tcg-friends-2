import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { Card, Rarity, BoosterType } from '@prisma/client';

interface GeneratedCard extends Card {
  isShiny: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Validation du boosterId
    const { boosterId } = req.body;
    if (!boosterId || typeof boosterId !== 'number') {
      return res.status(400).json({ error: 'ID du booster invalide' });
    }

    // Récupérer la configuration du booster
    const boosterConfig = await prisma.boosterConfig.findUnique({
      where: { id: boosterId },
    });

    if (!boosterConfig) {
      return res.status(404).json({ error: 'Configuration du booster non trouvée' });
    }

    // Vérifier que l'utilisateur a assez de crédits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.credits < boosterConfig.cost) {
      return res.status(400).json({ error: 'Crédits insuffisants' });
    }

    // Générer les cartes selon les règles du booster
    const cards = await generateCards(boosterConfig);

    // Créer l'achat du booster
    const boosterPurchase = await prisma.boosterPurchase.create({
      data: {
        userId: session.user.id,
        type: boosterConfig.type,
        cost: boosterConfig.cost,
        cards: {
          create: cards.map(card => ({
            cardId: card.id,
            isShiny: card.isShiny,
          })),
        },
      },
    });

    // Mettre à jour ou créer les cartes dans la collection
    const collectionUpdates = cards.map(card => 
      prisma.collectedCard.upsert({
        where: {
          userId_cardId_isShiny: {
            userId: session.user.id,
            cardId: card.id,
            isShiny: card.isShiny,
          },
        },
        update: {
          quantity: { increment: 1 },
          isNew: true,
        },
        create: {
          userId: session.user.id,
          cardId: card.id,
          isShiny: card.isShiny,
          isNew: true,
          quantity: 1,
        },
      })
    );

    // Mettre à jour les crédits de l'utilisateur
    const creditUpdate = prisma.user.update({
      where: { id: session.user.id },
      data: {
        credits: { decrement: boosterConfig.cost },
        totalBoostersOpened: { increment: 1 },
      },
    });

    // Exécuter toutes les opérations dans une transaction
    const [updatedUser] = await prisma.$transaction([
      creditUpdate,
      ...collectionUpdates,
    ]);

    // Mettre à jour les statistiques si des cartes légendaires ou shiny ont été trouvées
    const legendaryCount = cards.filter(card => card.rarity === 'LEGENDARY').length;
    const shinyCount = cards.filter(card => card.isShiny).length;

    if (legendaryCount > 0 || shinyCount > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          legendaryCardsFound: { increment: legendaryCount },
          shinyCardsFound: { increment: shinyCount },
        },
      });
    }

    return res.status(200).json({
      cards,
      credits: updatedUser.credits,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du booster:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'ouverture du booster' });
  }
}

async function generateCards(boosterConfig: { type: BoosterType; cardCount: number }): Promise<GeneratedCard[]> {
  const cards: GeneratedCard[] = [];
  const allCards = await prisma.card.findMany();

  // Fonction pour obtenir une carte aléatoire selon la rareté
  const getRandomCard = (rarity: Rarity): Card => {
    const cardsOfRarity = allCards.filter(card => card.rarity === rarity);
    if (cardsOfRarity.length === 0) {
      throw new Error(`Aucune carte de rareté ${rarity} trouvée`);
    }
    return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
  };

  // Fonction pour déterminer si une carte est shiny (5% de chance)
  const isShiny = (): boolean => Math.random() < 0.05;

  try {
    // Générer les cartes selon le type de booster
    switch (boosterConfig.type) {
      case BoosterType.EPIC:
        // Première carte avec les probabilités : 45% normal, 50% épique, 5% légendaire
        const rand = Math.random();
        let firstCard;
        if (rand < 0.45) {
          // 45% de chance d'avoir une carte normale (COMMON à RARE)
          const normalRand = Math.random();
          if (normalRand < 0.6) {
            firstCard = getRandomCard('COMMON');
          } else if (normalRand < 0.9) {
            firstCard = getRandomCard('UNCOMMON');
          } else {
            firstCard = getRandomCard('RARE');
          }
        } else if (rand < 0.95) {
          // 50% de chance d'avoir une épique
          firstCard = getRandomCard('EPIC');
        } else {
          // 5% de chance d'avoir une légendaire
          firstCard = getRandomCard('LEGENDARY');
        }
        cards.push({
          ...firstCard,
          isShiny: isShiny(),
        });

        // Cartes supplémentaires
        for (let i = 1; i < boosterConfig.cardCount; i++) {
          const card = getRandomCard('COMMON');
          cards.push({
            ...card,
            isShiny: isShiny(),
          });
        }
        break;

      case BoosterType.RARE:
        // Une carte rare garantie
        cards.push({
          ...getRandomCard('RARE'),
          isShiny: isShiny(),
        });
        // Cartes supplémentaires
        for (let i = 1; i < boosterConfig.cardCount; i++) {
          const card = getRandomCard('COMMON');
          cards.push({
            ...card,
            isShiny: isShiny(),
          });
        }
        break;

      case BoosterType.STANDARD:
        // Une carte peu commune garantie
        cards.push({
          ...getRandomCard('UNCOMMON'),
          isShiny: isShiny(),
        });
        // Cartes supplémentaires
        for (let i = 1; i < boosterConfig.cardCount; i++) {
          const card = getRandomCard('COMMON');
          cards.push({
            ...card,
            isShiny: isShiny(),
          });
        }
        break;

      case BoosterType.MAXI:
        // Une carte rare garantie et plus de cartes
        cards.push({
          ...getRandomCard('RARE'),
          isShiny: isShiny(),
        });
        // Cartes supplémentaires avec meilleur taux de rareté
        for (let i = 1; i < boosterConfig.cardCount; i++) {
          const rarity = Math.random() < 0.3 ? 'UNCOMMON' : 'COMMON';
          const card = getRandomCard(rarity as Rarity);
          cards.push({
            ...card,
            isShiny: isShiny(),
          });
        }
        break;
    }

    return cards;
  } catch (error) {
    console.error('Erreur lors de la génération des cartes:', error);
    throw new Error('Erreur lors de la génération des cartes');
  }
} 