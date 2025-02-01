import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Card, Rarity } from '@prisma/client';
import { toast } from 'sonner';
import Image from 'next/image';

interface FormData {
  name: string;
  description: string;
  quote?: string | null;
  power: string;
  rarity: Rarity;
  imageUrl: string;
  setId: number;
  image: File | null;
}

export default function EditCard() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sets, setSets] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    quote: null,
    power: '',
    rarity: 'COMMON',
    imageUrl: '',
    setId: 0,
    image: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Charger la liste des sets
        const setsResponse = await fetch('/api/admin/sets');
        if (!setsResponse.ok) {
          throw new Error('Erreur lors de la récupération des sets');
        }
        const setsData = await setsResponse.json();
        setSets(setsData);

        // Charger les données de la carte
        const cardResponse = await fetch(`/api/admin/cards/${id}`);
        if (!cardResponse.ok) {
          throw new Error('Erreur lors de la récupération de la carte');
        }
        const cardData = await cardResponse.json();
        setFormData({
          ...cardData,
          power: cardData.power.toString(),
          image: null,
        });
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des données');
        router.push('/admin/cards');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let imageBase64 = null;
      if (formData.image) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(formData.image);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      }

      const response = await fetch(`/api/admin/cards/${id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageBase64,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la mise à jour de la carte');
      }

      toast.success('Carte mise à jour avec succès !');
      router.push('/admin/cards');
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        toast.error(`Erreur: ${error.message}`);
      } else {
        toast.error('Une erreur inattendue est survenue');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Édition de la carte</h1>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Édition de la carte</h1>
        <button
          onClick={() => router.push('/admin/cards')}
          className="px-4 py-2 bg-game-dark text-white rounded-lg hover:bg-game-dark/80 transition-colors"
        >
          Retour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="game-panel p-6">
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
                value={formData.quote || ''}
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
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Rarity })}
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
              <label htmlFor="set" className="block text-sm font-medium">
                Set
              </label>
              <select
                id="set"
                className="w-full px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none"
                value={formData.setId}
                onChange={(e) => setFormData({ ...formData, setId: Number(e.target.value) })}
                required
              >
                <option value="">Sélectionnez un set</option>
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name} ({set.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="block text-sm font-medium">
                Nouvelle image (optionnel)
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 bg-game-dark/50 rounded-lg border border-game-accent/20 focus:border-game-accent focus:outline-none"
                onChange={handleImageChange}
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full px-4 py-2 bg-game-accent text-white rounded-lg hover:bg-game-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>

        <div className="game-panel p-6">
          <h2 className="text-xl font-bold mb-4">Aperçu</h2>
          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden">
            <Image
              src={formData.image ? URL.createObjectURL(formData.image) : formData.imageUrl || ''}
              alt={formData.name || ''}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 