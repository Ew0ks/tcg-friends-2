import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FaChevronDown } from 'react-icons/fa';
import { HomeIcon } from '@heroicons/react/24/outline';
import { User } from 'next-auth';
import { GearIcon } from '@radix-ui/react-icons';

interface NavigationProps {
  user: User;
  pendingTrades: number;
}

const Navigation: React.FC<NavigationProps> = ({ user, pendingTrades }) => {
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
          <div className="absolute top-full left-0 mt-1 bg-game-dark rounded-lg shadow-xl border border-game-accent/10 overflow-hidden min-w-[160px] z-50">
            <Link
              href="/collection"
              className="block px-4 py-2 text-game-text hover:bg-game-light hover:text-game-accent transition-colors"
              onClick={() => setIsCollectionsOpen(false)}
            >
              Mes cartes
            </Link>
            <div className="h-px bg-game-light/20 mx-2" />
            <Link
              href="/collections"
              className="block px-4 py-2 text-game-text hover:bg-game-light hover:text-game-accent transition-colors"
              onClick={() => setIsCollectionsOpen(false)}
            >
              Collections des joueurs
            </Link>
            <div className="h-px bg-game-light/20 mx-2" />
            <Link
              href="/library"
              className="block px-4 py-2 text-game-text hover:bg-game-light hover:text-game-accent transition-colors"
              onClick={() => setIsCollectionsOpen(false)}
            >
              Catalogue
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
      <div className="relative">
        <Link href="/trades" className="p-2 text-game-text hover:text-game-accent transition-colors rounded-lg hover:bg-game-dark">
          Échanges
        </Link>
        {pendingTrades > 0 && (
          <div className="absolute -top-1 -right-1 bg-game-success text-game-dark text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center z-10">
            {pendingTrades}
          </div>
        )}
      </div>
      {user && user.role === 'ADMIN' && (
        <>
          <div className="h-4 w-px bg-game-dark/50" />
          <Link
            href="/admin"
            className="p-2 text-game-success hover:text-game-accent transition-colors rounded-lg hover:bg-game-dark flex items-center gap-2"
          >
            <GearIcon className="h-4 w-4" />
            Admin
          </Link>
        </>
      )}
    </div>
  );
};

export default Navigation; 