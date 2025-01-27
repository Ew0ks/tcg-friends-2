import { AppProps } from 'next/app';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { useEffect } from 'react';

// Le composant principal de l'application
function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider 
      session={session}
    >
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

// Définir le type correct pour AppContent
type AppContentProps = {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
};

function AppContent({ Component, pageProps }: AppContentProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const publicPages = ['/', '/login', '/signup'];
    const isPublicPage = publicPages.includes(router.pathname);

    if (!session && !isPublicPage && status !== 'loading') {
      router.push('/login');
    }
  }, [session, router, status]);

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  return (
    <>
      {session?.user && (
        <Header 
          credits={session.user.credits || 0} 
          onLogout={() => signOut({ redirect: false }).then(() => router.push('/login'))}
          user={session.user}
        />
      )}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 