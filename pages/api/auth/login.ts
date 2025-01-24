import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        credits: true, // S'assurer que nous sélectionnons les crédits
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Authentification réussie
      const { password: _, ...userWithoutPassword } = user;
      console.log('Login successful:', userWithoutPassword); // Debug
      res.status(200).json({ 
        message: 'Connexion réussie', 
        user: userWithoutPassword 
      });
    } else {
      res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 