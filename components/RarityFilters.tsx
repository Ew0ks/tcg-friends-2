import { Rarity } from '@prisma/client';

interface RarityFiltersProps {
  selectedRarity: Rarity | null;
  onChange: (rarity: Rarity | null) => void;
  className?: string;
}

const RarityFilters: React.FC<RarityFiltersProps> = ({
  selectedRarity,
  onChange,
  className = "",
}) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    <button
      onClick={() => onChange(null)}
      className={`px-3 py-1 text-sm rounded-full transition-colors ${
        selectedRarity === null 
          ? 'bg-game-accent text-white' 
          : 'bg-game-light hover:bg-game-accent/50'
      }`}
    >
      Tout
    </button>
    {Object.values(Rarity).map((rarity) => (
      <button
        key={rarity}
        onClick={() => onChange(rarity)}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${
          selectedRarity === rarity 
            ? 'bg-game-accent text-white' 
            : 'bg-game-light hover:bg-game-accent/50'
        }`}
      >
        {rarity}
      </button>
    ))}
  </div>
);

export default RarityFilters; 