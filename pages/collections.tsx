import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserStats {
  id: number;
  username: string;
  stats: {
    totalCards: number;
    uniqueCards: number;
    shinyCards: number;
  };
}

const CollectionsPage = () => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections/public');
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Erreur lors du chargement des collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-game-accent mb-8">Collections publiques</h1>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-game-accent mb-8">Collections publiques</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {users.map((user) => (
          <Link 
            key={user.id} 
            href={`/collection/${user.id}`}
            className="block"
          >
            <div className="game-panel p-3 hover:ring-2 hover:ring-game-accent transition-all">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-game-accent">
                  {user.username}
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <span className="text-game-muted">Total</span>
                    <p className="font-bold">{user.stats.totalCards}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-game-muted">Uniques</span>
                    <p className="font-bold">{user.stats.uniqueCards}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-game-muted">Shiny</span>
                    <p className="font-bold text-yellow-400">{user.stats.shinyCards}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {users.length === 0 && (
          <div className="col-span-full text-center py-12 game-panel">
            <p className="text-game-muted">
              Aucune collection publique disponible pour le moment.
            </p>
            <p className="text-sm text-game-muted mt-2">
              Les utilisateurs peuvent rendre leur collection publique dans leurs paramètres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage; 