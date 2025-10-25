import { safeRead, safeRemove, safeWrite } from '../storage/localStorageUtils';

const USERS_KEY = 'bookmemo_auth_users';
const SESSION_KEY = 'bookmemo_auth_current_user';

export const loadUsers = () => safeRead(USERS_KEY, []);

export const saveUsers = (users) => {
  safeWrite(USERS_KEY, users);
};

export const loadCurrentUser = () => safeRead(SESSION_KEY, null);

export const saveCurrentUser = (user) => {
  if (!user) {
    safeRemove(SESSION_KEY);
    return;
  }

  safeWrite(SESSION_KEY, user);
};

export const clearCurrentUser = () => {
  safeRemove(SESSION_KEY);
};
