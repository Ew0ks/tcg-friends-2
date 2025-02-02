import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import PageTitleTooltip from '../../components/PageTitleTooltip';

interface User {
  id: number;
  username: string;
  role: UserRole;
  credits: number;
  totalBoostersOpened: number;
  legendaryCardsFound: number;
  shinyCardsFound: number;
}

const AdminUsers: React.FC = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [editingCredits, setEditingCredits] = useState<{[key: number]: boolean}>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      const res = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    }
  };

  const handleCreditsChange = async (userId: number, newCredits: number) => {
    try {
      const res = await fetch('/api/admin/users/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount: newCredits, operation: 'update' }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(user => 
          user.id === userId ? { ...user, credits: data.user.credits } : user
        ));
        setEditingCredits({ ...editingCredits, [userId]: false });
        toast.success(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des crédits:', error);
      toast.error('Erreur lors de la mise à jour des crédits');
    }
  };

  const handleBulkCreditsUpdate = async (amount: number) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/users/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, operation: 'bulk' }),
      });

      if (res.ok) {
        const data = await res.json();
        // Rafraîchir la liste des utilisateurs
        const updatedRes = await fetch('/api/admin/users');
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setUsers(updatedData);
        }
        toast.success(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour en masse des crédits:', error);
      toast.error('Erreur lors de la mise à jour en masse des crédits');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
      }
    };

    if (session?.user?.role === UserRole.ADMIN) {
      fetchUsers();
    }
  }, [session]);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-game-accent mb-8">Accès refusé</h1>
        <p className="text-game-text">Vous n&apos;avez pas les droits pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <PageTitleTooltip 
          title="Gestion des utilisateurs"
          tooltip="Gérez les comptes utilisateurs, leurs rôles et leurs permissions. Vous pouvez promouvoir ou rétrograder les utilisateurs."
        />
        <button
          onClick={() => router.push('/admin')}
          className="game-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>
      </div>

      <div className="game-panel p-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium mr-2">Crédits en masse :</span>
          <button
            onClick={() => handleBulkCreditsUpdate(50)}
            disabled={isUpdating}
            className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            +50
          </button>
          <button
            onClick={() => handleBulkCreditsUpdate(100)}
            disabled={isUpdating}
            className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            +100
          </button>
          <button
            onClick={() => handleBulkCreditsUpdate(200)}
            disabled={isUpdating}
            className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            +200
          </button>
          <span className="mx-2">|</span>
          <button
            onClick={() => handleBulkCreditsUpdate(-50)}
            disabled={isUpdating}
            className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            -50
          </button>
          <button
            onClick={() => handleBulkCreditsUpdate(-100)}
            disabled={isUpdating}
            className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            -100
          </button>
          <button
            onClick={() => handleBulkCreditsUpdate(-200)}
            disabled={isUpdating}
            className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            -200
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full game-panel">
            <thead>
              <tr className="text-left">
                <th className="p-4">Nom d&apos;utilisateur</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Crédits</th>
                <th className="p-4">Boosters ouverts</th>
                <th className="p-4">Légendaires trouvées</th>
                <th className="p-4">Shiny trouvées</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-game-accent/20">
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="bg-game-dark text-game-text p-1 rounded border border-game-muted"
                    >
                      {Object.values(UserRole).map((role) => (
                        <option key={role} value={role}>
                          {role.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    {editingCredits[user.id] ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={user.credits}
                          className="w-24 bg-game-dark text-game-text p-1 rounded border border-game-muted"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              handleCreditsChange(user.id, parseInt(target.value));
                            }
                          }}
                          onBlur={(e) => handleCreditsChange(user.id, parseInt(e.target.value))}
                        />
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer hover:text-game-accent"
                        onClick={() => setEditingCredits({ ...editingCredits, [user.id]: true })}
                      >
                        {user.credits}
                      </div>
                    )}
                  </td>
                  <td className="p-4">{user.totalBoostersOpened}</td>
                  <td className="p-4">{user.legendaryCardsFound}</td>
                  <td className="p-4">{user.shinyCardsFound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers; 