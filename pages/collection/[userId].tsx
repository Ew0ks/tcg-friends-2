import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Card from '../../components/Card';
import { Rarity } from '@prisma/client';
import Link from 'next/link';
import TradeModal from '../../components/TradeModal';
import RarityFilters from '../../components/RarityFilters';
import { toast } from 'sonner';

interface CollectedCard {
  id: number;
  card: {
    id: number;
    name: string;
    rarity: Rarity;
    description: string;
    quote?: string;
    power: number;
    imageUrl: string;
  };
  isShiny: boolean;
  quantity: number;
}

interface UserCollection {
  username: string;
  cards: CollectedCard[];
  stats: {
    totalCards: number;
    uniqueCards: number;
    shinyCards: number;
    missingCards: number;
    completionPercentage: number;
  };
}

const UserCollectionPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { data: session } = useSession();
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [shinyFilter, setShinyFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('rarity-desc');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [userCards, setUserCards] = useState<CollectedCard[]>([]);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedRarity) params.append('rarity', selectedRarity.toString());
        if (shinyFilter) params.append('shiny', shinyFilter);
        params.append('sort', sortOrder);

        const response = await fetch(`/api/collection/${userId}?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Collection non trouvée ou privée');
        }
        const data = await response.json();
        setCollection(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la collection:', error);
        router.push('/collections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [userId, searchTerm, selectedRarity, shinyFilter, sortOrder, router]);

  useEffect(() => {
    const fetchUserCards = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/collection');
          const data = await response.json();
          setUserCards(data.cards);
        } catch (error) {
          console.error('Erreur lors du chargement de vos cartes:', error);
        }
      }
    };

    fetchUserCards();
  }, [session]);

  const handleTrade = async (data: {
    recipientId: number;
    offeredCards: { cardId: number; isShiny: boolean; quantity: number }[];
    requestedCards: { cardId: number; isShiny: boolean; quantity: number }[];
    message?: string;
  }) => {
    try {
      const response = await fetch('/api/trades/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Échange proposé avec succès !');
        setIsTradeModalOpen(false);
      } else {
        const error = await response.json();
        console.error('Erreur lors de la création de l\'échange:', error);
        toast.error(error.message || 'Erreur lors de la création de l\'échange');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'échange:', error);
      toast.error('Une erreur est survenue lors de la création de l\'échange');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  const isOwnCollection = session?.user?.id === Number(userId);

  return (
    <div className="container mx-auto p-8">
      <div className="bg-game-dark/50 -mx-8 -mt-8 mb-8 px-8 py-4 border-b border-game-accent/20">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <p className="text-game-muted mb-1">Collection publique</p>
            <h1 className="text-3xl font-bold text-game-accent">
              Collection de {collection.username}
            </h1>
          </div>
          <Link 
            href="/collections" 
            className="text-game-muted hover:text-game-accent transition-colors"
          >
            ← Retour aux collections
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-8 game-panel p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-game-muted mb-2">
              Rechercher
            </label>
            <input
              type="text"
              className="game-input w-full"
              placeholder="Rechercher une carte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-game-muted mb-2">
              Version
            </label>
            <select
              className="game-input w-full"
              value={shinyFilter}
              onChange={(e) => setShinyFilter(e.target.value)}
            >
              <option value="">Toutes les versions</option>
              <option value="false">Normal</option>
              <option value="true">Shiny</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats de collection */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Total des cartes</h3>
          <p className="text-2xl">{collection.stats.totalCards}</p>
        </div>
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Cartes uniques</h3>
          <p className="text-2xl">{collection.stats.uniqueCards}</p>
        </div>
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Cartes Shiny</h3>
          <p className="text-2xl">{collection.stats.shinyCards}</p>
        </div>
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Cartes manquantes</h3>
          <p className="text-2xl text-game-error">{collection.stats.missingCards}</p>
        </div>
        <div className="game-panel text-center">
          <h3 className="text-xl font-bold text-game-accent">Complétion</h3>
          <p className="text-2xl">{collection.stats.completionPercentage}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold text-game-accent">Collection</h2>
          <RarityFilters
            selectedRarity={selectedRarity}
            onChange={setSelectedRarity}
          />
        </div>
        <select
          className="game-input ml-4"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="date-desc">Plus récentes d&apos;abord</option>
          <option value="date-asc">Plus anciennes d&apos;abord</option>
          <option value="rarity-desc">Plus rares d&apos;abord</option>
          <option value="rarity-asc">Moins rares d&apos;abord</option>
          <option value="name-asc">A à Z</option>
          <option value="name-desc">Z à A</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collection.cards.map((collectedCard) => (
          <div 
            key={`${collectedCard.card.id}-${collectedCard.isShiny}`} 
            className="relative flex justify-center"
          >
            <Card 
              {...collectedCard.card} 
              isShiny={collectedCard.isShiny}
              quantity={collectedCard.quantity}
            />
          </div>
        ))}

        {collection.cards.length === 0 && (
          <div className="col-span-full text-center py-12 game-panel">
            <p className="text-game-muted">
              Aucune carte dans cette collection.
            </p>
          </div>
        )}
      </div>

      {!isOwnCollection && session?.user && (
        <button
          onClick={() => setIsTradeModalOpen(true)}
          className="px-4 py-2 bg-game-accent text-white rounded hover:bg-opacity-80 fixed bottom-10 left-10"
        >
          Proposer un échange
        </button>
      )}

      {isTradeModalOpen && (
        <TradeModal
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          userCards={userCards}
          recipientCards={collection.cards}
          recipientId={Number(userId)}
          onSubmit={handleTrade}
        />
      )}
    </div>
  );
};

export default UserCollectionPage; 