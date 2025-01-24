import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
}

interface StoredSession {
  user: any;
  expiresAt: number;
}

const SESSION_DURATION = 72 * 60 * 60 * 1000; // 72 heures en millisecondes
const AUTH_KEY = 'tcg_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser l'état avec la session stockée
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(AUTH_KEY);
      if (storedSession) {
        const session: StoredSession = JSON.parse(storedSession);
        if (Date.now() < session.expiresAt) {
          console.log('Initial session loaded:', session.user);
          setUser(session.user);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading initial session:', error);
      localStorage.removeItem(AUTH_KEY);
    }
    setIsInitialized(true);
  }, []);

  // Sauvegarder l'utilisateur et la date d'expiration
  const handleSetUser = (newUser: any) => {
    console.log('AuthContext: Setting user to:', newUser);
    
    if (newUser) {
      const session: StoredSession = {
        user: newUser,
        expiresAt: Date.now() + SESSION_DURATION,
      };
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        console.log('Session saved to localStorage:', session);
      } catch (error) {
        console.error('Error saving session:', error);
      }
    } else {
      localStorage.removeItem(AUTH_KEY);
      console.log('Session removed from localStorage');
    }

    setUser(newUser);
  };

  // Vérifier et renouveler la session périodiquement
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedSession = localStorage.getItem(AUTH_KEY);
        if (storedSession) {
          const session: StoredSession = JSON.parse(storedSession);
          if (Date.now() < session.expiresAt) {
            const renewedSession: StoredSession = {
              user: session.user,
              expiresAt: Date.now() + SESSION_DURATION,
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(renewedSession));
          } else {
            localStorage.removeItem(AUTH_KEY);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    const interval = setInterval(checkSession, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isInitialized) {
    return null; // ou un loader si vous préférez
  }

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 