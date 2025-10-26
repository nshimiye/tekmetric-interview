import { safeRead, safeRemove, safeWrite } from '../storage/localStorageUtils';

export interface Memo {
  id: string;
  body: string;
  createdAt: string;
}

export type UserLibrary = Record<string, Memo[]>;

const LIBRARY_KEY_PREFIX = 'bookmemo_library_';

const getLibraryKey = (userId: string): string => `${LIBRARY_KEY_PREFIX}${userId}`;

export const loadUserLibrary = (userId: string): UserLibrary => {
  if (!userId) {
    return {};
  }

  const stored = safeRead<unknown>(getLibraryKey(userId), null);
  if (!stored || typeof stored !== 'object') {
    return {};
  }

  return stored as UserLibrary;
};

export const saveUserLibrary = (userId: string, library: UserLibrary): void => {
  if (!userId) {
    return;
  }

  if (!library || Object.keys(library).length === 0) {
    safeRemove(getLibraryKey(userId));
    return;
  }

  safeWrite(getLibraryKey(userId), library);
};

