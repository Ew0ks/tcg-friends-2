import { NextResponse } from 'next/server';
import { PrismaClient, BoosterType } from '@prisma/client';

const prisma = new PrismaClient();

const defaultBoosters = [
  {
    type: BoosterType.STANDARD,
    cost: 100,
    cardCount: 4,
    description: 'Contient 4 cartes dont au moins une peu commune'
  },
  {
    type: BoosterType.RARE,
    cost: 170,
    cardCount: 4,
    description: 'Contient 4 cartes dont au moins une rare'
  },
  {
    type: BoosterType.LEGENDARY,
    cost: 500,
    cardCount: 1,
    description: 'Contient 1 carte légendaire'
  }
];

export async function GET() {
  try {
    // Récupérer la configuration des boosters depuis la base de données
    const boosterConfigs = await prisma.boosterConfig.findMany();

    // Si aucune configuration n'existe, utiliser les valeurs par défaut
    if (boosterConfigs.length === 0) {
      return NextResponse.json(defaultBoosters);
    }

    // Mapper les configurations pour inclure les descriptions
    const boosters = boosterConfigs.map(config => ({
      type: config.type,
      cost: config.cost,
      cardCount: config.cardCount,
      description: defaultBoosters.find(b => b.type === config.type)?.description || ''
    }));

    return NextResponse.json(boosters);
  } catch (error) {
    console.error('Erreur lors de la récupération des boosters:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des boosters' },
      { status: 500 }
    );
  }
} 