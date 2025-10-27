import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearCurrentUser,
  loadCurrentUser,
  loadUsers,
  saveCurrentUser,
  saveUsers,
  type User,
} from './authStorage';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (credentials: { name: string; email: string; password: string }) => Promise<PublicUser>;
  login: (credentials: { email: string; password: string }) => Promise<PublicUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const createUserId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const toPublicUser = (user: User | null): PublicUser | null => {
  if (!user) {
    return null;
  }

  const { id, name, email } = user;
  return { id, name, email };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      try {
        const [storedUsers, storedSession] = await Promise.all([loadUsers(), loadCurrentUser()]);
        if (!isActive) {
          return;
        }

        setUsers(Array.isArray(storedUsers) ? storedUsers : []);
        setCurrentUser(toPublicUser(storedSession));
      } catch (error) {
        console.error('Failed to initialize auth storage', error);
        if (!isActive) {
          return;
        }

        setUsers([]);
        setCurrentUser(null);
      } finally {
        if (isActive) {
          setIsInitialized(true);
        }
      }
    };

    void initialize();

    return () => {
      isActive = false;
    };
  }, []);

  const register = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }): Promise<PublicUser> => {
    const trimmedName = name?.trim();
    const trimmedPassword = password?.trim();
    const normalizedEmail = normalizeEmail(email ?? '');

    if (!trimmedName || !normalizedEmail || !trimmedPassword) {
      throw new Error('Please fill out name, email, and password.');
    }

    const existing = users.find(
      (candidate) => normalizeEmail(candidate.email) === normalizedEmail,
    );

    if (existing) {
      throw new Error('An account with that email already exists.');
    }

    const newUser: User = {
      id: createUserId(),
      name: trimmedName,
      email: normalizedEmail,
      password: trimmedPassword,
    };

    const nextUsers = [...users, newUser];
    await saveUsers(nextUsers);
    await saveCurrentUser(newUser);
    setUsers(nextUsers);

    const publicUser = toPublicUser(newUser)!;
    setCurrentUser(publicUser);
    setIsInitialized(true);
    return publicUser;
  }, [users]);

  const login = useCallback(async ({ email, password }: { email: string; password: string }): Promise<PublicUser> => {
    const normalizedEmail = normalizeEmail(email ?? '');
    const trimmedPassword = password?.trim();

    if (!normalizedEmail || !trimmedPassword) {
      throw new Error('Please enter your email and password.');
    }

    const match = users.find(
      (candidate) => normalizeEmail(candidate.email) === normalizedEmail,
    );

    if (!match || match.password !== trimmedPassword) {
      throw new Error('Invalid email or password.');
    }

    const publicUser = toPublicUser(match)!;
    await saveCurrentUser(match);
    setCurrentUser(publicUser);
    setIsInitialized(true);
    return publicUser;
  }, [users]);

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
      register,
      login,
      logout,
    }),
    [currentUser, isInitialized, login, logout, register],
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
