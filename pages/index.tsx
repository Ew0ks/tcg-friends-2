import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PageTitleTooltip from '../components/PageTitleTooltip';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <PageTitleTooltip 
          title="Bienvenue sur TCG Xprcht"
          tooltip="Plongez dans l'univers passionnant de TCG Xprcht ! Collectionnez des cartes uniques, échangez avec d'autres joueurs et construisez votre collection de rêve."
          className="justify-center mb-4"
        />
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