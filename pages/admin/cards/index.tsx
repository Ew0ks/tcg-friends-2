import { useRouter } from 'next/router';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { Card } from '@prisma/client';
import Image from 'next/image';
import { toast } from 'sonner';
import PageTitleTooltip from '../../../components/PageTitleTooltip';

export default function AdminCards() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/admin/cards');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des cartes');
        }
        const data = await response.json();
        setCards(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des cartes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'text-yellow-400';
      case 'EPIC':
        return 'text-purple-400';
      case 'RARE':
        return 'text-blue-400';
      case 'UNCOMMON':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleDelete = async (cardId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cards/${cardId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la carte');
      }

      toast.success('Carte supprimée avec succès');
      // Mettre à jour la liste des cartes
      setCards(cards.filter(card => card.id !== cardId));
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression de la carte');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <PageTitleTooltip 
          title="Administration des cartes"
          tooltip="Gérez toutes les cartes du jeu. Créez, modifiez ou supprimez des cartes et leurs caractéristiques."
          className="mb-6"
        />
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <PageTitleTooltip 
          title="Administration des cartes"
          tooltip="Gérez toutes les cartes du jeu. Créez, modifiez ou supprimez des cartes et leurs caractéristiques."
        />
        <button
          onClick={() => router.push('/admin/cards/create')}
          className="flex items-center gap-2 px-4 py-2 bg-game-accent text-white rounded-lg hover:bg-game-accent/80 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Nouvelle carte
        </button>
      </div>

      <div className="game-panel p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-game-accent/20">
                <th className="text-left py-2 px-4">Image</th>
                <th className="text-left py-2 px-4">Nom</th>
                <th className="text-left py-2 px-4">Rareté</th>
                <th className="text-left py-2 px-4">Puissance</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id} className="border-b border-game-accent/10 hover:bg-game-dark/30">
                  <td className="py-2 px-4">
                    <div className="relative w-12 h-16 rounded overflow-hidden">
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div>
                      <div className="font-medium">{card.name}</div>
                      <div className="text-sm text-game-text/60 line-clamp-1">{card.description}</div>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <span className={`font-medium ${getRarityColor(card.rarity)}`}>
                      {card.rarity}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <span className="font-medium">{card.power}</span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/cards/${card.id}/edit`)}
                        className="p-2 text-game-text hover:text-game-accent hover:bg-game-dark rounded-lg transition-colors"
                      >
                        <Pencil1Icon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-2 text-game-text hover:text-red-500 hover:bg-game-dark rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cards.length === 0 && (
            <div className="text-center py-8 text-game-text/60">
              Aucune carte trouvée
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 