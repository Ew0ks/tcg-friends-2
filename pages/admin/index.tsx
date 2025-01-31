import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { GearIcon, PersonIcon, CardStackIcon } from '@radix-ui/react-icons';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  if (!session?.user) {
    router.push('/');
    return null;
  }

  const adminModules = [
    {
      title: 'Gestion des cartes',
      description: 'Créer, modifier et supprimer des cartes du jeu',
      icon: <CardStackIcon className="w-8 h-8" />,
      href: '/admin/cards',
    },
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les comptes utilisateurs et leurs permissions',
      icon: <PersonIcon className="w-8 h-8" />,
      href: '/admin/users',
    },
    {
      title: 'Configuration',
      description: 'Paramètres généraux de l\'application',
      icon: <GearIcon className="w-8 h-8" />,
      href: '/admin/settings',
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Administration TCG Xprcht</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <div
            key={module.href}
            className="game-panel p-4 cursor-pointer hover:bg-game-dark/50 transition-colors"
            onClick={() => router.push(module.href)}
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-game-dark/50 rounded-lg">
                {module.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{module.title}</h2>
                <p className="text-sm text-game-text/80">{module.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 