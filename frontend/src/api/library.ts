import { API_BASE_URL } from './client';

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

const buildLibraryUrl = (userId: string): string =>
  `${API_BASE_URL}/library/${encodeURIComponent(userId)}`;


export const loadUserLibrary = async (userId: string): Promise<UserLibrary> => {

  const response = await fetch(buildLibraryUrl(userId));
  const payload = (await response.json()) as { library: UserLibrary };
  return payload.library;
};

export const saveUserLibrary = async (userId: string, library: UserLibrary): Promise<void> => {

  await fetch(buildLibraryUrl(userId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ library }),
  });
};
