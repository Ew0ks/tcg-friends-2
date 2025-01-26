import React, { useState } from 'react';
import Link from 'next/link';
import { FaCoins, FaUserCircle } from 'react-icons/fa';
import { Session } from 'next-auth';

interface HeaderProps {
  credits: number;
  onLogout: () => void;
  user: Session['user'];
}

const Header: React.FC<HeaderProps> = ({ credits, onLogout, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-game-light shadow-game p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <nav className="flex space-x-6">
          <Link href="/collection" className="text-game-text hover:text-game-accent transition-colors">
            Collection
          </Link>
          <Link href="/open-boosters" className="text-game-text hover:text-game-accent transition-colors">
            Ouvrir Booster
          </Link>
          {user && user.role === 'ADMIN' && (
            <Link
              href="/admin/users"
              className="text-game-success hover:text-game-accent transition-colors"
            >
              Administration
            </Link>
          )}
        </nav>
        <h1 className="text-2xl font-bold text-game-accent">Xprcht</h1>
        <div className="flex items-center space-x-6">
          <span className="flex items-center bg-game-dark px-3 py-1 rounded-full">
            <span className="font-semibold text-game-success">{credits}</span>
            <FaCoins className="ml-2 text-yellow-400 w-5 h-5" />
          </span>
          <div className="relative flex items-center">
            <span className="text-game-text mr-2">{user?.username}</span>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-game-text hover:text-game-accent transition-colors focus:outline-none"
            >
              <FaUserCircle className="w-6 h-6" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-game-light rounded-md shadow-game">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-game-text hover:bg-game-dark hover:text-game-accent transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 