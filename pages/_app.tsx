import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import Layout from '../components/Layout';
import BoostBanner from '../components/BoostBanner';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <BoostBanner />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--game-dark)',
            border: '1px solid var(--game-accent)',
            color: 'var(--game-text)',
          },
          className: 'game-toast',
        }}
      />
    </SessionProvider>
  );
} 