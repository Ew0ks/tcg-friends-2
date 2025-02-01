import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { useSession } from 'next-auth/react';

interface BoostInfo {
  active: boolean;
  message: string;
}

export default function BoostBanner() {
  const { data: session, status } = useSession();
  const [boostInfo, setBoostInfo] = useState<BoostInfo | null>(null);

  useEffect(() => {
    const checkBoostStatus = async () => {
      if (status !== 'authenticated' || !session) {
        return;
      }

      try {
        const res = await fetch('/api/boosters/active-boost', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          setBoostInfo(data);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du boost:', error);
      }
    };

    checkBoostStatus();
    const interval = setInterval(checkBoostStatus, 30000);
    return () => clearInterval(interval);
  }, [session, status]);

  return (
    <AnimatePresence mode="wait">
      {boostInfo?.active && (
        <motion.div
          key="boost-banner"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 25,
            duration: 0.5 
          }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="bg-gradient-to-r from-game-accent/40 via-game-accent/50 to-game-accent/40 backdrop-blur-md text-white/90 shadow-lg shadow-black/10">
            <div className="container mx-auto px-4">
              <div className="py-1.5 flex items-center justify-center gap-2 text-xs font-medium">
                <StarFilledIcon className="w-3 h-3 animate-pulse text-yellow-300/80" />
                <span>{boostInfo.message}</span>
                <StarFilledIcon className="w-3 h-3 animate-pulse text-yellow-300/80" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 