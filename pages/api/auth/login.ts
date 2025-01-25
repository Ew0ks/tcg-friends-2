import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Identifiants requis' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    // Créer la session
    res.setHeader('Set-Cookie', `auth=${user.id}; Path=/; HttpOnly; SameSite=Strict`);

    return res.status(200).json({
      message: 'Connexion réussie',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} 