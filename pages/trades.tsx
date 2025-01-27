import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card as CardType } from '@prisma/client';
import Card from '../components/Card';

type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

interface TradeCard {
  id: number;
  cardId: number;
  isShiny: boolean;
  quantity: number;
  card: Omit<CardType, 'description' | 'quote'> & {
    description: string;
    quote: string | null;
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

const TradesPage = () => {
  const { data: session } = useSession();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        console.log('Chargement des échanges pour le type:', activeTab);
        const response = await fetch(`/api/trades/list?type=${activeTab}`);
        const data = await response.json();
        console.log('Données reçues:', data);
        setTrades(data);
      } catch (error) {
        console.error('Erreur lors du chargement des échanges:', error);
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
      const response = await fetch('/api/trades/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradeOfferId: tradeId,
          accept: true,
        }),
      });

      if (response.ok) {
        // Rafraîchir la liste des échanges
        const updatedTrades = trades.map(trade =>
          trade.id === tradeId ? { ...trade, status: 'ACCEPTED' } : trade
        );
        setTrades(updatedTrades);
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'échange:', error);
    }
  };

  const handleRejectTrade = async (tradeId: number) => {
    try {
      const response = await fetch('/api/trades/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradeOfferId: tradeId,
          accept: false,
        }),
      });

      if (response.ok) {
        // Rafraîchir la liste des échanges
        const updatedTrades = trades.map(trade =>
          trade.id === tradeId ? { ...trade, status: 'REJECTED' } : trade
        );
        setTrades(updatedTrades);
      }
    } catch (error) {
      console.error('Erreur lors du rejet de l\'échange:', error);
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
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-game-accent mb-8">Échanges</h1>

      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'all' ? 'bg-game-accent text-white' : 'bg-game-light'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Tous
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'sent' ? 'bg-game-accent text-white' : 'bg-game-light'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          Envoyés
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'received' ? 'bg-game-accent text-white' : 'bg-game-light'
          }`}
          onClick={() => setActiveTab('received')}
        >
          Reçus
        </button>
      </div>

      <div className="space-y-6">
        {trades.map((trade) => (
          <div key={trade.id} className="game-panel p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-game-muted">
                  De <span className="font-bold text-game-accent">{trade.initiator.username}</span>
                  {' '}à{' '}
                  <span className="font-bold text-game-accent">{trade.recipient.username}</span>
                </p>
                <p className="text-sm text-game-muted">
                  Créé le {formatDate(trade.createdAt)}
                </p>
                {trade.message && (
                  <p className="mt-2 italic">{trade.message}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded text-white text-sm ${getStatusBadgeClass(trade.status)}`}>
                  {trade.status}
                </span>
                {trade.status === 'PENDING' && trade.recipientId === session?.user?.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptTrade(trade.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleRejectTrade(trade.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-game-accent mb-4">Cartes offertes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trade.offeredCards.map((tradeCard) => (
                    <div key={tradeCard.id} className="relative">
                      <Card {...tradeCard.card} isShiny={tradeCard.isShiny} />
                      {tradeCard.quantity > 1 && (
                        <div className="absolute top-2 right-2 bg-game-accent text-white px-2 py-1 rounded">
                          x{tradeCard.quantity}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-game-accent mb-4">Cartes demandées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trade.requestedCards.map((tradeCard) => (
                    <div key={tradeCard.id} className="relative">
                      <Card {...tradeCard.card} isShiny={tradeCard.isShiny} />
                      {tradeCard.quantity > 1 && (
                        <div className="absolute top-2 right-2 bg-game-accent text-white px-2 py-1 rounded">
                          x{tradeCard.quantity}
                        </div>
                      )}
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