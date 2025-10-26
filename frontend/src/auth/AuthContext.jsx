import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  clearCurrentUser,
  loadCurrentUser,
  loadUsers,
  saveCurrentUser,
  saveUsers,
} from './authStorage';

const AuthContext = createContext(undefined);

const normalizeEmail = (value) => value.trim().toLowerCase();

const createUserId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const toPublicUser = (user) => {
  if (!user) {
    return null;
  }

  const { id, name, email } = user;
  return { id, name, email };
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const storedUsers = loadUsers();
    return Array.isArray(storedUsers) ? storedUsers : [];
  });
  const [currentUser, setCurrentUser] = useState(() => toPublicUser(loadCurrentUser()));

  const upsertUsers = useCallback((updater) => {
    setUsers((prevUsers) => {
      const nextUsers = updater(prevUsers);
      saveUsers(nextUsers);
      return nextUsers;
    });
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
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

    const newUser = {
      id: createUserId(),
      name: trimmedName,
      email: normalizedEmail,
      password: trimmedPassword,
    };

    upsertUsers((prevUsers) => [...prevUsers, newUser]);

    const publicUser = toPublicUser(newUser);
    setCurrentUser(publicUser);
    saveCurrentUser(publicUser);
    return publicUser;
  }, [upsertUsers, users]);

  const login = useCallback(async ({ email, password }) => {
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

    const publicUser = toPublicUser(match);
    setCurrentUser(publicUser);
    saveCurrentUser(publicUser);
    return publicUser;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    clearCurrentUser();
  }, []);

  const value = useMemo(
    () => ({
      user: currentUser,
      isAuthenticated: Boolean(currentUser),
      register,
      login,
      logout,
    }),
    [currentUser, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
