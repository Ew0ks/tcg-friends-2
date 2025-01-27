import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { User } from 'next-auth';
import { HomeIcon } from '@heroicons/react/24/outline';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: User;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onLogout, user }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Petit délai pour permettre au navigateur de traiter le montage avant l'animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const MobileNavLinks = () => (
    <div className="flex flex-col space-y-4">
      <Link
        href="/"
        className="text-game-text hover:text-game-accent transition-colors flex items-center gap-2"
        onClick={onClose}
      >
        <HomeIcon className="h-6 w-6" />
        Accueil
      </Link>
      <Link
        href="/collection"
        className="text-game-text hover:text-game-accent transition-colors"
        onClick={onClose}
      >
        Collection
      </Link>
      <Link
        href="/collections"
        className="text-game-text hover:text-game-accent transition-colors"
        onClick={onClose}
      >
        Collections publiques
      </Link>
      <Link
        href="/open-boosters"
        className="text-game-text hover:text-game-accent transition-colors"
        onClick={onClose}
      >
        Ouvrir Booster
      </Link>
      <Link
        href="/merchant"
        className="text-game-text hover:text-game-accent transition-colors"
        onClick={onClose}
      >
        Marchand
      </Link>
      <Link
        href="/trades"
        className="text-game-text hover:text-game-accent transition-colors"
        onClick={onClose}
      >
        Échanges
      </Link>
      {user && user.role === 'ADMIN' && (
        <Link
          href="/admin/users"
          className="text-game-success hover:text-game-accent transition-colors"
          onClick={onClose}
        >
          Administration
        </Link>
      )}
    </div>
  );

  return (
    <div 
      className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Overlay avec fond sombre */}
      <div className="absolute inset-0 bg-game-dark bg-opacity-95" />

      {/* Contenu du menu */}
      <div 
        className={`relative w-full h-full transform transition-transform duration-300 ${
          isAnimating ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-game-text hover:text-game-accent"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Navigation */}
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-xl">
            <MobileNavLinks />
          </div>

          {/* Footer avec infos utilisateur */}
          <div className="p-8 border-t border-game-light">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-game-text text-lg">
                {user?.username}
              </div>
              <span className="text-game-muted">•</span>
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="text-game-text hover:text-game-accent transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu; 