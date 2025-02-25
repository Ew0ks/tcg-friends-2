import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/collection');
    } else {
      console.error('Erreur de connexion:', result?.error);
    }
  };

  return (
    <div className="min-h-screen bg-game-dark bg-[url('/game-pattern.png')] flex items-center justify-center p-4">
      <div className="game-panel w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-game-accent mb-8">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-game-muted mb-2">
              User Name
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
              Password
            </label>
            <input
              type="password"
              className="game-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="game-button w-full">
            Login
          </button>
          <div className="text-center space-y-2">
            <p className="text-game-muted text-sm">
              <a href="#" className="text-game-accent hover:text-opacity-80">
                Forget Me?
              </a>
            </p>
            <p className="text-game-muted text-sm">
              Pas encore de compte ?{' '}
              <Link 
                href="/signup" 
                className="text-game-accent hover:text-opacity-80 font-medium"
              >
                S&apos;inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 