import Modal from './Modal';

interface SaleRecap {
  COMMON: number;
  UNCOMMON: number;
  RARE: number;
  EPIC: number;
  LEGENDARY: number;
  shinyCount: number;
  totalCards: number;
}

interface SaleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recap: SaleRecap;
  totalPrice: number;
}

const SaleConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  recap,
  totalPrice
}: SaleConfirmationModalProps) => {
  const parts = [];
  if (recap.COMMON > 0) parts.push(`${recap.COMMON} carte${recap.COMMON > 1 ? 's' : ''} commune${recap.COMMON > 1 ? 's' : ''}`);
  if (recap.UNCOMMON > 0) parts.push(`${recap.UNCOMMON} carte${recap.UNCOMMON > 1 ? 's' : ''} peu commune${recap.UNCOMMON > 1 ? 's' : ''}`);
  if (recap.RARE > 0) parts.push(`${recap.RARE} carte${recap.RARE > 1 ? 's' : ''} rare${recap.RARE > 1 ? 's' : ''}`);
  if (recap.EPIC > 0) parts.push(`${recap.EPIC} carte${recap.EPIC > 1 ? 's' : ''} épique${recap.EPIC > 1 ? 's' : ''}`);
  if (recap.LEGENDARY > 0) parts.push(`${recap.LEGENDARY} carte${recap.LEGENDARY > 1 ? 's' : ''} légendaire${recap.LEGENDARY > 1 ? 's' : ''}`);

  const cardsRecap = parts.join(', ').replace(/,([^,]*)$/, ' et$1');
  const shinyRecap = recap.shinyCount > 0 ? ` dont ${recap.shinyCount} shiny${recap.shinyCount > 1 ? 's' : ''}` : '';

  const footerButtons = (
    <div className="flex gap-4">
      <button
        onClick={onClose}
        className="flex-1 py-2 bg-game-light text-game-text rounded-lg hover:bg-opacity-80 transition-colors"
      >
        Annuler
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-2 bg-game-accent text-white rounded-lg hover:bg-opacity-80 transition-colors font-bold"
      >
        Confirmer
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmation de vente"
      footer={footerButtons}
    >
      <div className="modal-container space-y-4">
        <p className="text-game-text">
          Vous allez vendre :
        </p>
        <div className="bg-game-light p-4 rounded-lg">
          <p className="text-game-text mb-2">{cardsRecap}</p>
          {recap.shinyCount > 0 && (
            <p className="text-yellow-400">{shinyRecap}</p>
          )}
          <p className="text-xl font-bold text-game-accent mt-4">
            Pour {totalPrice} crédits
          </p>
        </div>
        <p className="text-game-muted text-sm">
          Cette action est irréversible.
        </p>
      </div>
    </Modal>
  );
};

export default SaleConfirmationModal; 