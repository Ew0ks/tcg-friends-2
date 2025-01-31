import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

export default function CreateCard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quote: '',
    power: '',
    rarity: '',
    image: null as File | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convertir l'image en base64
      const base64 = await new Promise<string>((resolve, reject) => {
        if (!formData.image) {
          reject(new Error('Aucune image sélectionnée'));
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(formData.image);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const response = await fetch('/api/admin/cards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageBase64: base64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la carte');
      }

      toast.success('Carte créée avec succès !');
      router.push('/admin/cards');
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      } else {
        toast.error('Une erreur inattendue est survenue');
      }

      // Si nous avons une réponse avec des détails d'erreur
      if (error instanceof Response) {
        const errorData = await error.json();
        console.error('Détails de l\'erreur:', errorData);
        if (errorData.details) {
          // Afficher les champs manquants
          const missingFields = Object.entries(errorData.details)
            .filter(([_, missing]) => missing)
            .map(([field]) => field)
            .join(', ');
          if (missingFields) {
            toast.error(`Champs manquants : ${missingFields}`);
          }
        }
        if (errorData.error) {
          toast.error(`Détail : ${errorData.error}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Créer une nouvelle carte</h1>

      <form onSubmit={handleSubmit} className="game-panel p-6 max-w-xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Nom
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="quote" className="block text-sm font-medium">
              Citation (optionnel)
            </label>
            <input
              id="quote"
              type="text"
              className="w-full px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="power" className="block text-sm font-medium">
              Puissance
            </label>
            <input
              id="power"
              type="number"
              min="1"
              max="10"
              className="w-full px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none"
              value={formData.power}
              onChange={(e) => setFormData({ ...formData, power: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="rarity" className="block text-sm font-medium">
              Rareté
            </label>
            <select
              id="rarity"
              className="w-full px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none"
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
              required
            >
              <option value="">Sélectionnez une rareté</option>
              <option value="COMMON">Commune</option>
              <option value="UNCOMMON">Peu commune</option>
              <option value="RARE">Rare</option>
              <option value="EPIC">Épique</option>
              <option value="LEGENDARY">Légendaire</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="block text-sm font-medium">
              Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none"
              onChange={handleImageChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-game-accent text-white rounded-lg hover:bg-game-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Création en cours...' : 'Créer la carte'}
          </button>
        </div>
      </form>
    </div>
  );
} 