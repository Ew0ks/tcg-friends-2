import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaCoins, FaUserCircle } from 'react-icons/fa';
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

  const DesktopNavLinks = () => (
    <>
      <Link href="/" className="text-game-text hover:text-game-accent transition-colors">
        <HomeIcon className="h-6 w-6" />
      </Link>
      <Link href="/collection" className="text-game-text hover:text-game-accent transition-colors">
        Collection
      </Link>
      <Link href="/open-boosters" className="text-game-text hover:text-game-accent transition-colors">
        Ouvrir Booster
      </Link>
      <Link href="/merchant" className="text-game-text hover:text-game-accent transition-colors">
        Marchand
      </Link>
      {user && user.role === 'ADMIN' && (
        <Link
          href="/admin/users"
          className="text-game-success hover:text-game-accent transition-colors"
        >
          Administration
        </Link>
      )}
    </>
  );

  return (
    <header className="bg-game-light p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Menu burger pour mobile */}
        <button
          className="md:hidden text-game-text hover:text-game-accent"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Bars3Icon className="h-8 w-8" />
        </button>

        {/* Navigation desktop */}
        <nav className="hidden md:flex space-x-6">
          <DesktopNavLinks />
        </nav>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-game-accent">TCG Xprcht</h1>
        </Link>

        {/* User info */}
        <div className="flex items-center space-x-6">
          <span className="flex items-center bg-game-dark px-3 py-1 rounded-full">
            <span className="font-semibold text-game-success">{credits}</span>
            <FaCoins className="ml-2 text-yellow-400 w-5 h-5" />
          </span>
          <div className="relative flex items-center">
            <span className="text-game-text mr-2 hidden md:inline">{user?.username}</span>
            <button 
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-game-text hover:text-game-accent transition-colors focus:outline-none"
            >
              <FaUserCircle className="w-6 h-6" />
            </button>
            
            {isMenuOpen && (
              <div 
                ref={menuRef}
                className="absolute right-0 top-full mt-2 w-48 bg-game-light rounded-md shadow-lg z-50"
              >
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