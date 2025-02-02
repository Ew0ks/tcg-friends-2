import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Rarity } from '@prisma/client';
import { calculatePrice, getPriceConfig } from '../utils/merchantPrices';
import Card, { CardProps } from '../components/Card';
import SaleConfirmationModal from '../components/SaleConfirmationModal';
import RarityFilters from '../components/RarityFilters';
import PageTitleTooltip from '../components/PageTitleTooltip';
import { toast } from 'sonner';

interface CollectedCard extends CardProps {
  quantity: number;
}

interface SelectedCard {
  id: number;
  quantity: number;
  rarity: Rarity;
  isShiny: boolean;
}

interface CollectionApiResponse {
  cards: {
    card: CardProps;
    quantity: number;
    isShiny: boolean;
  }[];
}

interface SaleRecap {
  COMMON: number;
  UNCOMMON: number;
  RARE: number;
  EPIC: number;
  LEGENDARY: number;
  shinyCount: number;
  totalCards: number;
}

const MerchantPage = () => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [collection, setCollection] = useState<CollectedCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<Rarity | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Charger la collection
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedRarity) params.append('rarity', selectedRarity.toString());

        const response = await fetch(`/api/collection?${params.toString()}`, {
          credentials: 'include'
        });
        const data = (await response.json()) as CollectionApiResponse;
        if (data.cards) {
          setCollection(data.cards.map((item) => ({
            ...item.card,
            quantity: item.quantity,
            isShiny: item.isShiny,
            isNew: false
          })));
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la collection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchCollection();
    }
  }, [session, selectedRarity]);

  // Calculer le prix total
  useEffect(() => {
    const newTotal = selectedCards.reduce((acc, card) => {
      return acc + calculatePrice(card.rarity, card.quantity, card.isShiny);
    }, 0);
    setTotalPrice(newTotal);
  }, [selectedCards]);

  const handleCardSelect = (card: CollectedCard) => {
    setSelectedCards(prev => {
      const existingCard = prev.find(c => c.id === card.id && c.isShiny === card.isShiny);
      if (existingCard) {
        // Si on a pas atteint la quantité max, on incrémente
        if (existingCard.quantity < card.quantity) {
          return prev.map(c => 
            c.id === card.id && c.isShiny === card.isShiny
              ? { ...c, quantity: c.quantity + 1 }
              : c
          );
        }
        return prev;
      } else {
        // On ajoute la carte avec une quantité de 1
        return [...prev, {
          id: card.id,
          quantity: 1,
          rarity: card.rarity as Rarity,
          isShiny: card.isShiny
        }];
      }
    });
  };

  const handleRemoveCard = (cardId: number, isShiny: boolean) => {
    setSelectedCards(prev => {
      const existingCard = prev.find(c => c.id === cardId && c.isShiny === isShiny);
      if (existingCard) {
        if (existingCard.quantity > 1) {
          // Décrémenter la quantité
          return prev.map(c => 
            c.id === cardId && c.isShiny === isShiny
              ? { ...c, quantity: c.quantity - 1 }
              : c
          );
        } else {
          // Retirer la carte
          return prev.filter(c => c.id !== cardId || c.isShiny !== isShiny);
        }
      }
      return prev;
    });
  };

  if (status === 'loading' || isLoading) {
    return <div>Chargement...</div>;
  }

  if (!session) {
    return null;
  }

  const getSaleRecap = (): SaleRecap => {
    const recap = {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 0,
      EPIC: 0,
      LEGENDARY: 0,
      shinyCount: 0,
      totalCards: 0
    };

    selectedCards.forEach(card => {
      recap[card.rarity] += card.quantity;
      recap.totalCards += card.quantity;
      if (card.isShiny) {
        recap.shinyCount += card.quantity;
      }
    });

    return recap;
  };

  const handleSellClick = () => {
    setIsConfirmationOpen(true);
  };

  const handleSellCards = async () => {
    try {
      const response = await fetch('/api/merchant/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: selectedCards }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vente');
      }

      const data = await response.json();
      toast.success(`Vente réussie ! Vous avez gagné ${data.credits} crédits`);
      
      // Rafraîchir la session pour mettre à jour les crédits
      await updateSession();
      
      // Rafraîchir la collection
      const collectionResponse = await fetch('/api/collection', {
        credentials: 'include'
      });
      const collectionData = (await collectionResponse.json()) as CollectionApiResponse;
      if (collectionData.cards) {
        setCollection(collectionData.cards.map((item) => ({
          ...item.card,
          quantity: item.quantity,
          isShiny: item.isShiny,
          isNew: false
        })));
      }
      
      // Réinitialiser la sélection
      setSelectedCards([]);
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      toast.error('Erreur lors de la vente des cartes');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <PageTitleTooltip 
          title="Marchand"
          tooltip="Vendez vos cartes en double contre des crédits. Les cartes Shiny rapportent 50% de plus ! Profitez des prix avantageux pour les lots de 10 cartes identiques."
        />
        <RarityFilters
          selectedRarity={selectedRarity}
          onChange={setSelectedRarity}
        />
      </div>
      
      {/* Grille des prix */}
      <div className="bg-game-dark rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold text-game-accent mb-2">Prix de rachat</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
          {Object.entries(Rarity).map(([key, rarity]) => {
            const config = getPriceConfig(rarity);
            return (
              <div key={key} className="bg-game-light px-3 py-2 rounded-lg">
                <div className="font-bold mb-1">{rarity}</div>
                <div className="flex flex-col gap-1">
                <div className="flex justify-between text-game-muted">
                  <span>Unité</span>
                  <span>{config.single}💰</span>
                </div>
                <div className="flex justify-between text-game-muted">
                  <span>Lot de {config.bulkQuantity}</span>
                  <span>{config.bulk}💰</span>
                </div>
                  <div className="text-yellow-400 text-xs mt-1 text-center">Version Shiny ×1.5</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interface de sélection en deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collection (2/3 de l'écran) */}
        <div className="lg:col-span-2 bg-game-dark rounded-lg p-6">
          <h2 className="text-xl font-bold text-game-accent mb-4">Collection</h2>
          
          {/* Grille de cartes */}
          <div className="flex flex-wrap gap-4">
            {collection.map((card) => {
              const selectedQuantity = selectedCards.find(
                c => c.id === card.id && c.isShiny === card.isShiny
              )?.quantity || 0;
              const remainingQuantity = card.quantity - selectedQuantity;

              return (
                <div
                  key={`${card.id}-${card.isShiny}`}
                  className={`relative group cursor-pointer shrink-0 scale-50 hover:scale-55 -mx-16 -my-24 transition-all duration-200 ${
                    remainingQuantity === 0 ? 'opacity-50' : ''
                  }`}
                  onClick={() => remainingQuantity > 0 && handleCardSelect(card)}
                >
                  <Card {...card} quantity={remainingQuantity} />
                  {/* Prix de vente */}
                  <div className="
                    absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30
                    flex items-center justify-center transition-all
                  ">
                    <div className="opacity-0 group-hover:opacity-100 text-center">
                      <span className="text-lg font-bold text-yellow-400 bg-black/50 px-3 py-1 rounded">
                        {calculatePrice(card.rarity as Rarity, 1, card.isShiny)} 💰
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panier de vente (1/3 de l'écran) */}
        <div className="bg-game-dark rounded-lg p-6 sticky top-4 h-fit max-h-[calc(100vh-2rem)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-game-accent">Panier</h2>
            <span className="text-xl font-bold text-yellow-400">
              {totalPrice} crédits
            </span>
          </div>

          {selectedCards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-game-muted">
                Cliquez sur des cartes pour les ajouter au panier
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
                {selectedCards.map((card) => {
                  const cardData = collection.find(c => c.id === card.id && c.isShiny === card.isShiny);
                  if (!cardData) return null;
                  
                  return (
                    <div 
                      key={`${card.id}-${card.isShiny}`}
                      className="flex items-center justify-between bg-game-light p-2 rounded-lg"
                    >
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{cardData.name}</span>
                          {cardData.isShiny && (
                            <span className="text-yellow-400">✨</span>
                          )}
                        </div>
                        <div className="text-sm text-game-muted flex items-center gap-2">
                          <span>{card.rarity}</span>
                          <span>•</span>
                          <span>{calculatePrice(card.rarity, card.quantity, card.isShiny)} crédits</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveCard(card.id, card.isShiny)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-game-dark hover:bg-red-500/20 transition-colors text-sm"
                        >
                          -
                        </button>
                        <span className="w-4 text-center text-sm">{card.quantity}</span>
                        <button
                          onClick={() => handleCardSelect(cardData)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-game-dark hover:bg-green-500/20 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={handleSellClick}
                className="w-full py-3 bg-game-accent text-white rounded-lg hover:bg-opacity-80 transition-colors font-bold"
              >
                Vendre pour {totalPrice} crédits
              </button>
            </>
          )}
        </div>
      </div>

      <SaleConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleSellCards}
        recap={getSaleRecap()}
        totalPrice={totalPrice}
      />
    </div>
  );
};

export default MerchantPage; 