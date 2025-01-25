import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Récupérer l'utilisateur à partir du token
    const token = await getToken({ req: request as any });
    
    if (!token?.userId) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer la collection de l'utilisateur
    const collection = await prisma.collectedCard.findMany({
      where: {
        userId: token.userId as number,
      },
      include: {
        card: true,
      },
      orderBy: [
        { card: { rarity: 'desc' } },
        { isShiny: 'desc' },
        { card: { name: 'asc' } },
      ],
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la collection' },
      { status: 500 }
    );
  }
} 