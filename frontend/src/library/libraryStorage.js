import { safeRead, safeRemove, safeWrite } from '../storage/localStorageUtils';

const LIBRARY_KEY_PREFIX = 'bookmemo_library_';

const getLibraryKey = (userId) => `${LIBRARY_KEY_PREFIX}${userId}`;

export const loadUserLibrary = (userId) => {
  if (!userId) {
    return {};
  }

  const stored = safeRead(getLibraryKey(userId), null);
  if (!stored || typeof stored !== 'object') {
    return {};
  }

  return stored;
};

export const saveUserLibrary = (userId, library) => {
  if (!userId) {
    return;
  }

  if (!library || Object.keys(library).length === 0) {
    safeRemove(getLibraryKey(userId));
    return;
  }

  safeWrite(getLibraryKey(userId), library);
};
