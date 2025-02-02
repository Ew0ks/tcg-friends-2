import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCoins, FaUserCircle } from 'react-icons/fa';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { User } from 'next-auth';
import MobileMenu from './MobileMenu';
import Navigation from './Navigation';

interface HeaderProps {
  credits: number;
  onLogout: () => void;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ credits, onLogout, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingTrades, setPendingTrades] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchPendingTrades = async () => {
      try {
        const response = await fetch('/api/trades/list?type=received&status=PENDING');
        const data = await response.json();
        setPendingTrades(data.length);
      } catch (error) {
        console.error('Erreur lors de la récupération des échanges en attente:', error);
      }
    };

    if (user) {
      fetchPendingTrades();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(fetchPendingTrades, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="bg-[#1C111D] shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between md:justify-start gap-6">
          {/* Menu burger pour mobile */}
          <button
            className="md:hidden p-2 text-white hover:text-blue-300 hover:bg-[#2D1C2E] rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="https://res.cloudinary.com/dwyryncig/image/upload/v1738520812/logo_tcg-removebg-preview_byd8ij.png" 
              alt="TCG Xprcht Logo" 
              width={120}
              height={40}
              className="h-14 w-auto rounded"
              priority
            />
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <Navigation user={user} pendingTrades={pendingTrades} />
          </div>

          {/* User info */}
          <div className="flex items-center space-x-4">
            <span className="flex items-center bg-[#2D1C2E] px-3 py-1.5 rounded-lg">
              <span className="font-semibold text-blue-300">{credits}</span>
              <FaCoins className="ml-2 text-yellow-400 w-4 h-4" />
            </span>
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white hover:text-blue-300 hover:bg-[#243a63] rounded-lg transition-colors flex items-center space-x-2"
              >
                <span className="text-sm hidden md:inline">{user?.username}</span>
                <FaUserCircle className="w-5 h-5" />
              </button>
              
              {isMenuOpen && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#243a63] rounded-lg shadow-xl border border-game-accent/10 overflow-hidden z-50"
                >
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-white hover:bg-game-light hover:text-game-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Paramètres
                    </Link>
                    <div className="h-px bg-game-light/20 mx-2" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-white hover:bg-game-light hover:text-game-accent transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={onLogout}
        user={user}
        pendingTrades={pendingTrades}
      />
    </header>
  );
};

export default Header; 