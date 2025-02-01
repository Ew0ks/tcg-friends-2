import React, { useState } from 'react';
import { useRouter } from 'next/router';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      // Redirection vers la page de connexion après inscription réussie
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-game-dark bg-[url('/game-pattern.png')] flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-game-accent mb-8">S&apos;inscrire</h1>
        {error && (
          <div className="mb-4 p-3 bg-game-error bg-opacity-10 border border-game-error rounded text-game-error">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-game-muted mb-2">
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              className="game-input w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-game-muted mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              className="game-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button type="submit" className="game-button w-full">
            S&apos;inscrire
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup; 