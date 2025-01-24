import { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import { useRouter } from 'next/router';

// Le composant principal de l'application
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

// Composant qui utilise useAuth
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { useEffect, useState } from 'react';

// Définir le type correct pour AppContent
type AppContentProps = {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
};

function AppContent({ Component, pageProps }: AppContentProps) {
  const [credits, setCredits] = useState(0);
  const { user, setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('AppContent: Current user:', user);
    // Exclure les pages publiques de la redirection
    const publicPages = ['/login', '/signup'];
    const isPublicPage = publicPages.includes(router.pathname);

    if (!user && !isPublicPage) {
      console.log('Redirecting to login');
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    console.log('Current user:', user);
    if (user) {
      // Utiliser les crédits de l'utilisateur connecté
      setCredits(user.credits);
    }
  }, [user]);

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
    });
    if (res.ok) {
      setUser(null);
      // Rediriger vers la page d'accueil ou de connexion
      window.location.href = '/login';
    }
  };

  return (
    <>
      {user && <Header credits={credits} onLogout={handleLogout} />}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 