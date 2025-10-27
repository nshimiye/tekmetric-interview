import { safeRead, safeRemove, safeWrite } from "../storage/localStorageUtils";

// import { safeRead, safeRemove, safeWrite } from '../storage/localStorageUtils';
export interface Memo {
  id: string;
  body: string;
  createdAt: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  description: string;
  authors: string[];
  thumbnail: string | null;
  infoLink: string | null;
  publishedDate: string | null;
  source: string | null;
}

export interface LibraryEntry {
  book: LibraryBook;
  memos: Memo[];
}

export type UserLibrary = Record<string, LibraryEntry>;

const LIBRARY_KEY_PREFIX = 'bookmemo_library_';

const getLibraryKey = (userId: string): string => `${LIBRARY_KEY_PREFIX}${userId}`;

/**
 * Loads the user's library from local storage.
 * If userId is missing or there is no stored data, returns an empty object.
 * 
 * Example returned object:
 * {
 *   "bookId1": [
 *     { id: "memo1", body: "note1", createdAt: "2023-01-01T12:00:00Z" },
 *     { id: "memo2", body: "note2", createdAt: "2023-01-02T09:30:00Z" }
 *   ],
 *   "bookId2": [
 *     { id: "memo3", body: "another memo", createdAt: "2023-02-10T15:45:00Z" }
 *   ]
 * }
 * 
 * @param userId - The user's unique identifier
 * @returns UserLibrary object mapping book IDs to Memo arrays
 */
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

