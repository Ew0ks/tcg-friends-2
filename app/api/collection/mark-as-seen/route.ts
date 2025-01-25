import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Récupérer l'utilisateur à partir du token
    const token = await getToken({ req: request as any });
    
    if (!token?.userId) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { cardId, isShiny } = await request.json();

    // Mettre à jour la carte dans la collection
    await prisma.collectedCard.update({
      where: {
        userId_cardId_isShiny: {
          userId: token.userId as number,
          cardId,
          isShiny,
        },
      },
      data: {
        isNew: false,
      },
    });

    return NextResponse.json({ message: 'Carte marquée comme vue' });
  } catch (error) {
    console.error('Erreur lors du marquage de la carte:', error);
    return NextResponse.json(
      { message: 'Erreur lors du marquage de la carte' },
      { status: 500 }
    );
  }
} 