import { AuthProvider } from '@/context/AuthContext';
import { SessionProvider } from 'next-auth/react';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import '../src/styles/globals.css';

export const metadata: Metadata = {
  title: 'TCG Friends',
  description: 'Un jeu de cartes à collectionner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 