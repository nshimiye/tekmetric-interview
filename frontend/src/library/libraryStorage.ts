import { API_BASE_URL, assertApiResponseOk, isPlainObject } from '../api/client';

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

const buildLibraryUrl = (userId: string): string => `${API_BASE_URL}/library/${encodeURIComponent(userId)}`;

const parseLibraryResponse = async (response: Response): Promise<UserLibrary> => {
  const payload = (await response.json()) as unknown;
  if (!isPlainObject(payload)) {
    return {};
  }

  const library = payload.library;
  if (!isPlainObject(library)) {
    return {};
  }

  return library as UserLibrary;
};

export const loadUserLibrary = async (userId: string): Promise<UserLibrary> => {
  if (!userId) {
    return {};
  }

  const response = await fetch(buildLibraryUrl(userId));
  await assertApiResponseOk(response);
  return parseLibraryResponse(response);
};

export const saveUserLibrary = async (userId: string, library: UserLibrary): Promise<void> => {
  if (!userId) {
    return;
  }

  if (!library || Object.keys(library).length === 0) {
    await deleteUserLibrary(userId);
    return;
  }

  const response = await fetch(buildLibraryUrl(userId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ library }),
  });

  await assertApiResponseOk(response);
};

export const deleteUserLibrary = async (userId: string): Promise<void> => {
  if (!userId) {
    return;
  }

  const response = await fetch(buildLibraryUrl(userId), {
    method: 'DELETE',
  });

  if (response.status === 204) {
    return;
  }

  await assertApiResponseOk(response);
};
