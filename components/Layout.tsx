import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Header from './Header';
import BoostBanner from './BoostBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const navigation = [
    { name: 'Collection', href: '/collection' },
    { name: 'Merchant', href: '/merchant' },
    { name: 'Trades', href: '/trades' },
    { name: 'Achievements', href: '/achievements' },
  ];

  useEffect(() => {
    const publicPages = ['/', '/login', '/signup'];
    const isPublicPage = publicPages.includes(router.pathname);

    if (!session && !isPublicPage && status !== 'loading') {
      router.push('/login');
    }
  }, [session, router, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-game-background text-game-text flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-background text-game-text relative">
      {session?.user && (
        <>
          <Header 
            credits={session.user.credits || 0} 
            onLogout={() => signOut({ redirect: false }).then(() => router.push('/login'))}
            user={session.user}
          />
          <BoostBanner />
        </>
      )}
      <main className="pb-16">
        {children}
      </main>
    </div>
  );
} 