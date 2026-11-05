import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { DEMO_USER } from '../mocks/mockData';
import { safeStorage } from '../utils/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, organization?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<void>;
  resetToDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'traunes_ai_auth_user';
const STORAGE_KEY_IS_LOGGED = 'traunes_ai_auth_logged_in';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Logged in by default for smooth initial demo experience
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = safeStorage.getItem(STORAGE_KEY_AUTH);
      const storedLoggedIn = safeStorage.getItem(STORAGE_KEY_IS_LOGGED);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(DEMO_USER);
        safeStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(DEMO_USER));
      }

      if (storedLoggedIn !== null) {
        setIsAuthenticated(storedLoggedIn === 'true');
      } else {
        setIsAuthenticated(true);
        safeStorage.setItem(STORAGE_KEY_IS_LOGGED, 'true');
      }
    } catch (e) {
      setUser(DEMO_USER);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      safeStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(newUser));
    } else {
      safeStorage.removeItem(STORAGE_KEY_AUTH);
    }
  };

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    // Frontend demo validation
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Veuillez saisir une adresse e-mail valide.' };
    }

    const current = user ?? DEMO_USER;
    const updatedUser: UserProfile = {
      ...current,
      email: email.trim().toLowerCase(),
    };
    saveUser(updatedUser);
    setIsAuthenticated(true);
    safeStorage.setItem(STORAGE_KEY_IS_LOGGED, 'true');
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    _password: string,
    organization?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Le nom doit comporter au moins 2 caractères.' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Veuillez renseigner une adresse e-mail valide.' };
    }

    const newUser: UserProfile = {
      ...DEMO_USER,
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      organization: organization?.trim() || 'Organisme indépendant',
      joinedDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      stats: {
        totalChecks: 0,
        claimsExamined: 0,
        sourcesConsulted: 0,
        reportsExported: 0,
      },
    };

    saveUser(newUser);
    setIsAuthenticated(true);
    safeStorage.setItem(STORAGE_KEY_IS_LOGGED, 'true');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    safeStorage.setItem(STORAGE_KEY_IS_LOGGED, 'false');
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    saveUser(next);
  };

  const updatePreferences = (prefs: Partial<UserProfile['preferences']>) => {
    if (!user) return;
    const next: UserProfile = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
    };
    saveUser(next);
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!oldPass) {
      return { success: false, error: 'Veuillez indiquer le mot de passe actuel.' };
    }
    if (!newPass || newPass.length < 8) {
      return { success: false, error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' };
    }
    return { success: true };
  };

  const deleteAccount = async (): Promise<void> => {
    safeStorage.removeItem(STORAGE_KEY_AUTH);
    safeStorage.removeItem(STORAGE_KEY_IS_LOGGED);
    setUser(null);
    setIsAuthenticated(false);
  };

  const resetToDemoUser = () => {
    saveUser(DEMO_USER);
    setIsAuthenticated(true);
    safeStorage.setItem(STORAGE_KEY_IS_LOGGED, 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        changePassword,
        deleteAccount,
        resetToDemoUser,
      }}
    >
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
