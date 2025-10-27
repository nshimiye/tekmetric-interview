import { safeRead, safeRemove, safeWrite } from '../storage/localStorageUtils';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

const USERS_KEY = 'bookmemo_auth_users';
const SESSION_KEY = 'bookmemo_auth_current_user';

export const loadUsers = (): User[] => safeRead<User[]>(USERS_KEY, []);

export const saveUsers = (users: User[]): void => {
  safeWrite(USERS_KEY, users);
};

export const loadCurrentUser = (): User | null => safeRead<User | null>(SESSION_KEY, null);

export const saveCurrentUser = (user: User | null): void => {
  if (!user) {
    safeRemove(SESSION_KEY);
    return;
  }

  safeWrite(SESSION_KEY, user);
};

export const clearCurrentUser = (): void => {
  safeRemove(SESSION_KEY);
};

