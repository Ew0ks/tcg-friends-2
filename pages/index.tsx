import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  useEffect(() => {
    const checkDailyReward = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/daily-reward', {
          method: 'POST',
        });
        const data = await response.json();

        if (response.ok) {
          toast.success(data.message, {
            description: `Revenez demain pour recevoir plus de crédits !`,
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la récompense quotidienne:', error);
      }
    };

    checkDailyReward();
  }, [session]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-game-accent mb-4">Bienvenue sur TCG Xprcht</h1>
        <p className="text-xl text-game-text mb-8">Découvrez l&apos;univers passionnant des cartes à collectionner !</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="game-panel p-6">
          <h2 className="text-xl font-bold text-game-accent mb-4">Collectionnez</h2>
          <p className="text-game-text">Ouvrez des boosters et collectionnez plus de 100 cartes uniques, dont certaines en version brillante !</p>
        </div>
        <div className="game-panel p-6">
          <h2 className="text-xl font-bold text-game-accent mb-4">5 Raretés</h2>
          <p className="text-game-text">Découvrez des cartes communes, peu communes, rares, épiques et légendaires, chacune avec son style unique.</p>
        </div>
        <div className="game-panel p-6">
          <h2 className="text-xl font-bold text-game-accent mb-4">4 Types de Boosters</h2>
          <p className="text-game-text">Choisissez parmi différents boosters pour maximiser vos chances d&apos;obtenir des cartes rares !</p>
        </div>
      </div>

      <div className="flex justify-center space-x-6">
        {!session?.user ? (
          <>
            <Link 
              href="/signup" 
              className="game-button px-8 py-3 text-lg"
            >
              Commencer l&apos;aventure
            </Link>
            <Link 
              href="/login" 
              className="game-button-secondary px-8 py-3 text-lg"
            >
              Se connecter
            </Link>
          </>
        ) : (
          <Link 
            href="/collection" 
            className="game-button px-8 py-3 text-lg"
          >
            Accéder à ma collection
          </Link>
        )}
      </div>
    </div>
  );
} 