import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Logique pour déconnecter l'utilisateur
    // Par exemple, supprimer le cookie ou l'état de l'utilisateur
    res.status(200).json({ message: 'Déconnexion réussie' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 