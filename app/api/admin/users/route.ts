import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Vérifier que l'utilisateur est admin
    const token = await getToken({ req: request as any });
    
    if (!token?.userId) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: token.userId as number },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        credits: true,
        totalBoostersOpened: true,
        legendaryCardsFound: true,
        shinyCardsFound: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
} 