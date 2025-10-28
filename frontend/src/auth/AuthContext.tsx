import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearCurrentUser, loadCurrentUser, type User } from './authStorage';
import { API_BASE_URL } from '../api/client';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  login: (credentials: { email: string; password: string }) => Promise<PublicUser>;
  register: (credentials: { name: string; email: string; password: string }) => Promise<PublicUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const toPublicUser = (user: User | null): PublicUser | null => {
  if (!user) return null;
  const { id, name, email } = user;
  return { id, name, email };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isActive = true;
    const initialize = async () => {
      try {
        const storedSession = await loadCurrentUser();
        if (!isActive) return;
        setCurrentUser(toPublicUser(storedSession));
      } catch (error) {
        console.error('Failed to initialize auth storage', error);
        if (!isActive) return;
        setCurrentUser(null);
      } finally {
        if (isActive) setIsInitialized(true);
      }
    };
    void initialize();
    return () => { isActive = false; };
  }, []);



  const login = useCallback(async ({ email, password }: { email: string; password: string }): Promise<PublicUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || 'Login failed');
    }
    const payload = await response.json();
    const user = payload.user;
    if (!user) throw new Error('No user returned');
    setCurrentUser(user);
    return user;
  }, []);

  const register = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }): Promise<PublicUser> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || 'Registration failed');
    }
    const payload = await response.json();
    const user = payload.user;
    if (!user) throw new Error('No user returned');
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    void clearCurrentUser().catch((error) => {
      console.error('Failed to clear current user', error);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: currentUser,
      isAuthenticated: Boolean(currentUser),
      isLoading: !isInitialized,
      logout,
      login,
      register,
    }),
    [currentUser, isInitialized, logout, login, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
