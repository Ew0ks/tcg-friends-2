import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

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
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-game-accent mb-8">Gestion des Utilisateurs</h1>
      
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
                <td className="p-4">{user.credits}</td>
                <td className="p-4">{user.totalBoostersOpened}</td>
                <td className="p-4">{user.legendaryCardsFound}</td>
                <td className="p-4">{user.shinyCardsFound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers; 