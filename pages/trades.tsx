import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CardProps } from '../components/Card';
import { toast } from 'sonner';

type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

interface TradeCard {
  id: number;
  cardId: number;
  isShiny: boolean;
  quantity: number;
  card: Omit<CardProps, 'quote'> & {
    quote?: string;
  };
}

interface Trade {
  id: number;
  initiatorId: number;
  recipientId: number;
  status: TradeStatus;
  message?: string;
  expiresAt: Date;
  createdAt: Date;
  initiator: {
    username: string;
  };
  recipient: {
    username: string;
  };
  offeredCards: TradeCard[];
  requestedCards: TradeCard[];
}

interface ApiTradeResponse {
  id: number;
  initiatorId: number;
  recipientId: number;
  status: string;
  message?: string;
  expiresAt: string;
  createdAt: string;
  initiator: {
    username: string;
  };
  recipient: {
    username: string;
  };
  offeredCards: {
    id: number;
    cardId: number;
    isShiny: boolean;
    quantity: number;
    card: {
      id: number;
      name: string;
      rarity: string;
      description: string;
      power: number;
      imageUrl: string;
      quote?: string;
    };
  }[];
  requestedCards: {
    id: number;
    cardId: number;
    isShiny: boolean;
    quantity: number;
    card: {
      id: number;
      name: string;
      rarity: string;
      description: string;
      power: number;
      imageUrl: string;
      quote?: string;
    };
  }[];
}

const TradesPage = () => {
  const { data: session } = useSession();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received' | 'history'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        console.log('Chargement des échanges pour le type:', activeTab);
        const response = await fetch(`/api/trades/list?type=${activeTab}`);
        const data = await response.json();
        console.log('Données reçues:', data);
        
        // Vérifier et convertir les données en type Trade[]
        const validTrades = Array.isArray(data) ? data.map((trade: ApiTradeResponse) => {
          // Vérifier que le statut est valide
          if (!['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(trade.status)) {
            throw new Error(`Statut d'échange invalide: ${trade.status}`);
          }

          const status = trade.status as TradeStatus;

          return {
            id: trade.id,
            initiatorId: trade.initiatorId,
            recipientId: trade.recipientId,
            status,
            message: trade.message,
            expiresAt: new Date(trade.expiresAt),
            createdAt: new Date(trade.createdAt),
            initiator: trade.initiator,
            recipient: trade.recipient,
            offeredCards: trade.offeredCards.map((card) => ({
              id: card.id,
              cardId: card.cardId,
              isShiny: card.isShiny,
              quantity: card.quantity,
              card: {
                ...card.card,
                quote: card.card.quote || undefined
              }
            })),
            requestedCards: trade.requestedCards.map((card) => ({
              id: card.id,
              cardId: card.cardId,
              isShiny: card.isShiny,
              quantity: card.quantity,
              card: {
                ...card.card,
                quote: card.card.quote || undefined
              }
            }))
          };
        }) : [];

        // Filtrer les trades actifs vs historique
        const filteredTrades = validTrades.filter(trade => {
          const isHistoryTab = activeTab === 'history';
          const isCompleted = ['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(trade.status);
          return isHistoryTab ? isCompleted : !isCompleted;
        });
        
        setTrades(filteredTrades);
      } catch (error) {
        console.error('Erreur lors du chargement des échanges:', error);
        setTrades([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchTrades();
    }
  }, [session, activeTab]);

  const handleAcceptTrade = async (tradeId: number) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'acceptation de l\'échange');
      }

      toast.success('Échange accepté avec succès !');
      // Rafraîchir la liste des échanges
      const updatedTrades = trades.map(trade =>
        trade.id === tradeId ? { ...trade, status: 'ACCEPTED' } : trade
      );
      setTrades(updatedTrades);
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'échange:', error);
      toast.error('Erreur lors de l\'acceptation de l\'échange');
    }
  };

  const handleRejectTrade = async (tradeId: number) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors du refus de l\'échange');
      }

      toast.success('Échange refusé');
      // Rafraîchir la liste des échanges
      const updatedTrades = trades.map(trade =>
        trade.id === tradeId ? { ...trade, status: 'REJECTED' } : trade
      );
      setTrades(updatedTrades);
    } catch (error) {
      console.error('Erreur lors du refus de l\'échange:', error);
      toast.error('Erreur lors du refus de l\'échange');
    }
  };

  const getStatusBadgeClass = (status: TradeStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'ACCEPTED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      case 'EXPIRED':
        return 'bg-gray-500';
      case 'CANCELLED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-game-accent mb-8">Échanges</h1>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-game-accent mb-4">Échanges</h1>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1.5 rounded text-sm ${
            activeTab === 'all' ? 'bg-game-accent text-white' : 'bg-game-light'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Actifs
        </button>
        <button
          className={`px-3 py-1.5 rounded text-sm ${
            activeTab === 'sent' ? 'bg-game-accent text-white' : 'bg-game-light'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          Envoyés
        </button>
        <button
          className={`px-3 py-1.5 rounded text-sm ${
            activeTab === 'received' ? 'bg-game-accent text-white' : 'bg-game-light'
          }`}
          onClick={() => setActiveTab('received')}
        >
          Reçus
        </button>
        <button
          className={`px-3 py-1.5 rounded text-sm ${
            activeTab === 'history' ? 'bg-game-accent text-white' : 'bg-game-light'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Historique
        </button>
      </div>

      <div className="grid gap-3">
        {trades.map((trade) => (
          <div key={trade.id} className="game-panel p-3">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-game-accent truncate">{trade.initiator.username}</span>
                  <span className="text-game-muted">→</span>
                  <span className="font-medium text-game-accent truncate">{trade.recipient.username}</span>
                  <span className={`px-2 py-0.5 rounded text-white text-xs ${getStatusBadgeClass(trade.status)}`}>
                    {trade.status}
                  </span>
                </div>
                <p className="text-xs text-game-muted">
                  {formatDate(trade.createdAt)}
                </p>
                {trade.message && (
                  <p className="text-sm italic text-game-muted mt-1 line-clamp-1">{trade.message}</p>
                )}
              </div>
              {trade.status === 'PENDING' && trade.recipientId === session?.user?.id && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAcceptTrade(trade.id)}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleRejectTrade(trade.id)}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="text-sm font-semibold text-game-accent mb-2">Cartes offertes</h3>
                <div className="space-y-1">
                  {trade.offeredCards.map((tradeCard) => (
                    <div 
                      key={tradeCard.id} 
                      className="flex items-center gap-2 text-sm bg-game-dark/30 rounded px-2 py-1"
                    >
                      <span className="font-medium truncate flex-1">
                        {tradeCard.card.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs shrink-0">
                        <span className={`px-1.5 py-0.5 rounded ${
                          tradeCard.card.rarity === 'LEGENDARY' ? 'bg-yellow-500/20 text-yellow-300' :
                          tradeCard.card.rarity === 'RARE' ? 'bg-purple-500/20 text-purple-300' :
                          tradeCard.card.rarity === 'UNCOMMON' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {tradeCard.card.rarity.charAt(0)}
                        </span>
                        {tradeCard.quantity > 1 && (
                          <span className="bg-game-accent/20 text-game-accent px-1.5 py-0.5 rounded">
                            x{tradeCard.quantity}
                          </span>
                        )}
                        {tradeCard.isShiny && (
                          <span className="text-yellow-500">✨</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-game-accent mb-2">Cartes demandées</h3>
                <div className="space-y-1">
                  {trade.requestedCards.map((tradeCard) => (
                    <div 
                      key={tradeCard.id} 
                      className="flex items-center gap-2 text-sm bg-game-dark/30 rounded px-2 py-1"
                    >
                      <span className="font-medium truncate flex-1">
                        {tradeCard.card.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs shrink-0">
                        <span className={`px-1.5 py-0.5 rounded ${
                          tradeCard.card.rarity === 'LEGENDARY' ? 'bg-yellow-500/20 text-yellow-300' :
                          tradeCard.card.rarity === 'RARE' ? 'bg-purple-500/20 text-purple-300' :
                          tradeCard.card.rarity === 'UNCOMMON' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {tradeCard.card.rarity.charAt(0)}
                        </span>
                        {tradeCard.quantity > 1 && (
                          <span className="bg-game-accent/20 text-game-accent px-1.5 py-0.5 rounded">
                            x{tradeCard.quantity}
                          </span>
                        )}
                        {tradeCard.isShiny && (
                          <span className="text-yellow-500">✨</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {trades.length === 0 && (
          <div className="text-center py-12 game-panel">
            <p className="text-game-muted">
              Aucun échange {activeTab === 'sent' ? 'envoyé' : activeTab === 'received' ? 'reçu' : ''} pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradesPage; 