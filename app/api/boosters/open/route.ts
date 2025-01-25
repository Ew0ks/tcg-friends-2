import { NextResponse } from 'next/server';
import { PrismaClient, BoosterType, Rarity } from '@prisma/client';

const prisma = new PrismaClient();

const RARITY_WEIGHTS = {
  [Rarity.COMMON]: 70,
  [Rarity.UNCOMMON]: 20,
  [Rarity.RARE]: 8,
  [Rarity.LEGENDARY]: 2,
};

const SHINY_CHANCE = 0.1; // 10% de chance d'obtenir une carte shiny

function getRandomRarity(guaranteedMinRarity: Rarity): Rarity {
  const random = Math.random() * 100;
  let cumulativeWeight = 0;

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight && isRarityHigherOrEqual(rarity as Rarity, guaranteedMinRarity)) {
      return rarity as Rarity;
    }
  }

  return guaranteedMinRarity;
}

function isRarityHigherOrEqual(rarity1: Rarity, rarity2: Rarity): boolean {
  const rarityOrder = [Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE, Rarity.LEGENDARY];
  return rarityOrder.indexOf(rarity1) >= rarityOrder.indexOf(rarity2);
}

async function getRandomCard(rarity: Rarity) {
  const cards = await prisma.card.findMany({
    where: { rarity },
  });

  if (cards.length === 0) {
    throw new Error(`Aucune carte de rareté ${rarity} trouvée`);
  }

  return cards[Math.floor(Math.random() * cards.length)];
}

export async function POST(request: Request) {
  try {
    const { type, userId } = await request.json();

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer la configuration du booster
    const boosterConfig = await prisma.boosterConfig.findUnique({
      where: { type },
    });

    if (!boosterConfig) {
      return NextResponse.json(
        { message: 'Type de booster invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a assez de crédits
    if (user.credits < boosterConfig.cost) {
      return NextResponse.json(
        { message: 'Crédits insuffisants' },
        { status: 400 }
      );
    }

    // Déterminer la rareté minimale garantie selon le type de booster
    let guaranteedMinRarity: Rarity;
    switch (type) {
      case BoosterType.LEGENDARY:
        guaranteedMinRarity = Rarity.LEGENDARY;
        break;
      case BoosterType.RARE:
        guaranteedMinRarity = Rarity.RARE;
        break;
      default:
        guaranteedMinRarity = Rarity.UNCOMMON;
    }

    // Générer les cartes
    const cards: { card: any; isShiny: boolean }[] = [];
    for (let i = 0; i < boosterConfig.cardCount; i++) {
      const rarity = i === 0 ? guaranteedMinRarity : getRandomRarity(Rarity.COMMON);
      const card = await getRandomCard(rarity);
      const isShiny = Math.random() < SHINY_CHANCE;
      cards.push({ card, isShiny });
    }

    // Créer l'achat du booster
    const boosterPurchase = await prisma.boosterPurchase.create({
      data: {
        userId,
        type,
        cost: boosterConfig.cost,
        cards: {
          create: cards.map(({ card, isShiny }) => ({
            cardId: card.id,
            isShiny,
          })),
        },
      },
    });

    // Mettre à jour les statistiques de l'utilisateur
    const legendaryCount = cards.filter(({ card }) => card.rarity === Rarity.LEGENDARY).length;
    const shinyCount = cards.filter(({ isShiny }) => isShiny).length;

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: user.credits - boosterConfig.cost,
        totalBoostersOpened: user.totalBoostersOpened + 1,
        legendaryCardsFound: user.legendaryCardsFound + legendaryCount,
        shinyCardsFound: user.shinyCardsFound + shinyCount,
      },
    });

    // Mettre à jour la collection
    for (const { card, isShiny } of cards) {
      await prisma.collectedCard.upsert({
        where: {
          userId_cardId_isShiny: {
            userId,
            cardId: card.id,
            isShiny,
          },
        },
        update: {
          quantity: { increment: 1 },
          isNew: true,
        },
        create: {
          userId,
          cardId: card.id,
          isShiny,
          quantity: 1,
          isNew: true,
        },
      });
    }

    return NextResponse.json({
      message: 'Booster ouvert avec succès',
      boosterPurchase,
      cards,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du booster:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'ouverture du booster' },
      { status: 500 }
    );
  }
} 