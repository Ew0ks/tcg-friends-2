'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaCoins, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    Cookies.remove('token');
    window.location.href = '/login';
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    Cookies.remove('token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-game-light shadow-game p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <nav className="flex space-x-6">
          <Link href="/" className="text-game-accent font-bold">
            TCG Friends
          </Link>
          {user && (
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/collection" className="text-game-text hover:text-game-accent">
                Collection
              </Link>
              <Link href="/open-boosters" className="text-game-text hover:text-game-accent">
                Boosters
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="text-game-accent hover:text-game-accent-dark">
                  Admin
                </Link>
              )}
            </div>
          )}
        </nav>
        <h1 className="text-2xl font-bold text-game-accent">Xprcht</h1>
        <div className="flex items-center space-x-6">
          {user && (
            <span className="flex items-center bg-game-dark px-3 py-1 rounded-full">
              <span className="font-semibold text-game-success">{user.credits}</span>
              <FaCoins className="ml-2 text-yellow-400 w-5 h-5" />
            </span>
          )}
          <div className="relative">
            {user ? (
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-game-text hover:text-game-accent transition-colors focus:outline-none"
              >
                <FaUserCircle className="w-6 h-6" />
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className="text-game-text hover:text-game-accent cursor-pointer"
              >
                Connexion
              </button>
            )}
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-game-light rounded-md shadow-game">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
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