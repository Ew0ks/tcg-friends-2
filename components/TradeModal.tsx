import { useState } from 'react';
import { Card as CardType, Rarity } from '@prisma/client';
import Card from './Card';
import Modal from './Modal';
import RarityFilters from './RarityFilters';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCards: {
    card: CardType;
    isShiny: boolean;
    quantity: number;
  }[];
  recipientCards: {
    card: CardType;
    isShiny: boolean;
    quantity: number;
  }[];
  recipientId: number;
  onSubmit: (data: {
    recipientId: number;
    offeredCards: { cardId: number; isShiny: boolean; quantity: number }[];
    requestedCards: { cardId: number; isShiny: boolean; quantity: number }[];
    message?: string;
  }) => void;
}

const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  userCards,
  recipientCards,
  recipientId,
  onSubmit,
}) => {
  const [selectedOfferedCards, setSelectedOfferedCards] = useState<{
    [key: string]: number;
  }>({});
  const [selectedRequestedCards, setSelectedRequestedCards] = useState<{
    [key: string]: number;
  }>({});
  const [message, setMessage] = useState('');
  const [offeredRarityFilter, setOfferedRarityFilter] = useState<Rarity | null>(null);
  const [requestedRarityFilter, setRequestedRarityFilter] = useState<Rarity | null>(null);

  const handleCardSelection = (
    cardId: number,
    isShiny: boolean,
    maxQuantity: number,
    isOffered: boolean
  ) => {
    const key = `${cardId}-${isShiny}`;
    const selectedCards = isOffered ? selectedOfferedCards : selectedRequestedCards;
    const setSelectedCards = isOffered
      ? setSelectedOfferedCards
      : setSelectedRequestedCards;

    if (selectedCards[key]) {
      const newQuantity = selectedCards[key] + 1;
      if (newQuantity <= maxQuantity) {
        setSelectedCards({ ...selectedCards, [key]: newQuantity });
      }
    } else {
      setSelectedCards({ ...selectedCards, [key]: 1 });
    }
  };

  const handleCardDeselection = (
    cardId: number,
    isShiny: boolean,
    isOffered: boolean
  ) => {
    const key = `${cardId}-${isShiny}`;
    const selectedCards = isOffered ? selectedOfferedCards : selectedRequestedCards;
    const setSelectedCards = isOffered
      ? setSelectedOfferedCards
      : setSelectedRequestedCards;

    if (selectedCards[key] > 1) {
      setSelectedCards({
        ...selectedCards,
        [key]: selectedCards[key] - 1,
      });
    } else {
      const newSelectedCards = { ...selectedCards };
      delete newSelectedCards[key];
      setSelectedCards(newSelectedCards);
    }
  };

  const handleSubmit = () => {
    const offeredCards = Object.entries(selectedOfferedCards).map(([key, quantity]) => {
      const [cardId, isShiny] = key.split('-');
      return {
        cardId: parseInt(cardId),
        isShiny: isShiny === 'true',
        quantity,
      };
    });

    const requestedCards = Object.entries(selectedRequestedCards).map(([key, quantity]) => {
      const [cardId, isShiny] = key.split('-');
      return {
        cardId: parseInt(cardId),
        isShiny: isShiny === 'true',
        quantity,
      };
    });

    onSubmit({
      recipientId,
      offeredCards,
      requestedCards,
      message: message.trim() || undefined,
    });

    // Réinitialiser le formulaire
    setSelectedOfferedCards({});
    setSelectedRequestedCards({});
    setMessage('');
    onClose();
  };

  const filteredUserCards = offeredRarityFilter
    ? userCards.filter(({ card }) => card.rarity === offeredRarityFilter)
    : userCards;

  const filteredRecipientCards = requestedRarityFilter
    ? recipientCards.filter(({ card }) => card.rarity === requestedRarityFilter)
    : recipientCards;

  const footer = (
    <div className="flex justify-end gap-4">
      <button
        onClick={onClose}
        className="px-4 py-2 bg-game-light rounded hover:bg-opacity-80"
      >
        Annuler
      </button>
      <button
        onClick={handleSubmit}
        disabled={
          Object.keys(selectedOfferedCards).length === 0 ||
          Object.keys(selectedRequestedCards).length === 0
        }
        className="px-4 py-2 bg-game-accent text-white rounded hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Proposer l&apos;échange
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proposer un échange"
      maxWidth="full"
      footer={footer}
    >
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-game-accent">
              Vos cartes à offrir
            </h3>
            <RarityFilters
              selectedRarity={offeredRarityFilter}
              onChange={setOfferedRarityFilter}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 snap-x">
            {filteredUserCards.map(({ card, isShiny, quantity }) => {
              const key = `${card.id}-${isShiny}`;
              const selectedQuantity = selectedOfferedCards[key] || 0;

              return (
                <div 
                  key={key} 
                  className="relative group shrink-0 snap-start scale-50 hover:scale-55 -mx-12 -my-20 transition-all duration-200"
                >
                  <Card {...card} isShiny={isShiny} />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                      {selectedQuantity > 0 && (
                        <button
                          onClick={() => handleCardDeselection(card.id, isShiny, true)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          -
                        </button>
                      )}
                      {selectedQuantity < quantity && (
                        <button
                          onClick={() => handleCardSelection(card.id, isShiny, quantity, true)}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  {selectedQuantity > 0 && (
                    <div className="absolute top-2 right-2 bg-game-accent text-white px-2 py-1 rounded">
                      x{selectedQuantity}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-game-accent">
              Cartes demandées
            </h3>
            <RarityFilters
              selectedRarity={requestedRarityFilter}
              onChange={setRequestedRarityFilter}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 snap-x">
            {filteredRecipientCards.map(({ card, isShiny, quantity }) => {
              const key = `${card.id}-${isShiny}`;
              const selectedQuantity = selectedRequestedCards[key] || 0;

              return (
                <div 
                  key={key} 
                  className="relative group shrink-0 snap-start scale-50 hover:scale-55 -mx-12 -my-20 transition-all duration-200"
                >
                  <Card {...card} isShiny={isShiny} />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                      {selectedQuantity > 0 && (
                        <button
                          onClick={() => handleCardDeselection(card.id, isShiny, false)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          -
                        </button>
                      )}
                      {selectedQuantity < quantity && (
                        <button
                          onClick={() => handleCardSelection(card.id, isShiny, quantity, false)}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  {selectedQuantity > 0 && (
                    <div className="absolute top-2 right-2 bg-game-accent text-white px-2 py-1 rounded">
                      x{selectedQuantity}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-game-muted mb-2">
            Message (optionnel)
          </label>
          <textarea
            className="game-input w-full h-24 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Laissez un message au destinataire..."
          />
        </div>
      </div>
    </Modal>
  );
};

export default TradeModal; 