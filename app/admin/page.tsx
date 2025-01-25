'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  role: 'USER' | 'ADMIN';
  credits: number;
  totalBoostersOpened: number;
  legendaryCardsFound: number;
  shinyCardsFound: number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Rediriger si non admin
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    }

    // Charger la liste des utilisateurs
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user, router]);

  const handleRoleUpdate = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    try {
      const res = await fetch('/api/admin/update-user-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      // Mettre à jour l'état local
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Erreur lors de la mise à jour du rôle');
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return <div>Accès non autorisé</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-game-accent mb-8">Panneau d&apos;Administration</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full bg-game-light rounded-lg">
          <thead>
            <tr className="border-b border-game-muted">
              <th className="p-4 text-left">Username</th>
              <th className="p-4 text-left">Rôle</th>
              <th className="p-4 text-left">Crédits</th>
              <th className="p-4 text-left">Boosters Ouverts</th>
              <th className="p-4 text-left">Légendaires</th>
              <th className="p-4 text-left">Shiny</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-game-muted">
                <td className="p-4">{user.username}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">{user.credits}</td>
                <td className="p-4">{user.totalBoostersOpened}</td>
                <td className="p-4">{user.legendaryCardsFound}</td>
                <td className="p-4">{user.shinyCardsFound}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value as 'USER' | 'ADMIN')}
                    className="game-input"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel; 