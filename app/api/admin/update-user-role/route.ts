import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    // Vérifier que l'utilisateur est admin
    const token = await getToken({ req: request as any });
    
    if (!token?.userId) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: token.userId as number },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { userId, newRole } = await request.json();

    // Vérifier que le rôle est valide
    if (!Object.values(UserRole).includes(newRole)) {
      return NextResponse.json(
        { message: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Mettre à jour le rôle de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        username: true,
        role: true,
        credits: true,
        totalBoostersOpened: true,
        legendaryCardsFound: true,
        shinyCardsFound: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du rôle' },
      { status: 500 }
    );
  }
} 