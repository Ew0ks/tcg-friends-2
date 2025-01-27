import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaCoins, FaUserCircle, FaChevronDown } from 'react-icons/fa';
import { Bars3Icon, HomeIcon } from '@heroicons/react/24/outline';
import { User } from 'next-auth';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  credits: number;
  onLogout: () => void;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ credits, onLogout, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const DesktopNavLinks = () => {
    const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
    const collectionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          collectionsRef.current &&
          !collectionsRef.current.contains(event.target as Node)
        ) {
          setIsCollectionsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className="flex items-center space-x-4">
        <Link href="/" className="p-2 text-game-text hover:text-game-accent transition-colors rounded-lg hover:bg-game-dark">
          <HomeIcon className="h-5 w-5" />
        </Link>
        <div className="h-4 w-px bg-game-dark/50" />
        
        {/* Menu Collections */}
        <div className="relative" ref={collectionsRef}>
          <button
            onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
            className="p-2 text-game-text hover:text-game-accent transition-colors rounded-lg hover:bg-game-dark flex items-center gap-1"
          >
            Collections
            <FaChevronDown className={`w-3 h-3 transition-transform ${isCollectionsOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isCollectionsOpen && (
            <div className="absolute top-full left-0 mt-1 bg-game-dark rounded-lg shadow-xl border border-game-accent/10 overflow-hidden min-w-[160px]">
              <Link
                href="/collection"
                className="block px-4 py-2 text-game-text hover:bg-game-light hover:text-game-accent transition-colors"
                onClick={() => setIsCollectionsOpen(false)}
              >
                Ma collection
              </Link>
              <div className="h-px bg-game-light/20 mx-2" />
              <Link
                href="/collections"
                className="block px-4 py-2 text-game-text hover:bg-game-light hover:text-game-accent transition-colors"
                onClick={() => setIsCollectionsOpen(false)}
              >
                Collections publiques
              </Link>
            </div>
          )}
        </div>

        <Link href="/open-boosters" className="p-2 text-game-text hover:text-game-accent transition-colors rounded-lg hover:bg-game-dark">
          Boosters
        </Link>
        <Link href="/merchant" className="p-2 text-game-text hover:text-game-accent transition-colors rounded-lg hover:bg-game-dark">
          Marchand
        </Link>
        <Link href="/trades" className="p-2 text-game-text hover:text-game-accent transition-colors rounded-lg hover:bg-game-dark">
          Échanges
        </Link>
        {user && user.role === 'ADMIN' && (
          <>
            <div className="h-4 w-px bg-game-dark/50" />
            <Link
              href="/admin/users"
              className="p-2 text-game-success hover:text-game-accent transition-colors rounded-lg hover:bg-game-dark"
            >
              Admin
            </Link>
          </>
        )}
      </div>
    );
  };

  return (
    <header className="bg-game-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between md:justify-start gap-6">
          {/* Menu burger pour mobile */}
          <button
            className="md:hidden p-2 text-game-text hover:text-game-accent hover:bg-game-dark rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-bold text-game-accent">TCG Xprcht</h1>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <DesktopNavLinks />
          </div>

          {/* User info */}
          <div className="flex items-center space-x-4">
            <span className="flex items-center bg-game-dark/50 px-3 py-1.5 rounded-lg">
              <span className="font-semibold text-game-success">{credits}</span>
              <FaCoins className="ml-2 text-yellow-400 w-4 h-4" />
            </span>
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-game-text hover:text-game-accent hover:bg-game-dark rounded-lg transition-colors flex items-center space-x-2"
              >
                <span className="text-sm hidden md:inline">{user?.username}</span>
                <FaUserCircle className="w-5 h-5" />
              </button>
              
              {isMenuOpen && (
                <div 
                  ref={menuRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-game-dark rounded-lg shadow-xl border border-game-accent/10 overflow-hidden"
                >
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-game-text hover:bg-game-light hover:text-game-accent transition-colors"
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
                      className="w-full flex items-center px-4 py-2 text-game-text hover:bg-game-light hover:text-game-accent transition-colors"
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
      />
    </header>
  );
};

export default Header; 