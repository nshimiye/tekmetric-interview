import { API_BASE_URL, assertApiResponseOk, isPlainObject } from './client';

export interface MemoAuthor {
  id: string | null;
  name: string;
}

export interface PublicMemo {
  id: string;
  body: string;
  createdAt: string;
  author: MemoAuthor;
  sharedAt: string;
}

export type PublicMemoStore = Record<string, PublicMemo[]>;

const PUBLIC_MEMOS_URL = `${API_BASE_URL}/public-memos`;
const PUBLIC_MEMOS_FOR_BOOK_URL = (bookId: string): string =>
  `${PUBLIC_MEMOS_URL}/${encodeURIComponent(bookId)}`;

export const loadPublicMemoStore = async (): Promise<PublicMemoStore> => {
  const response = await fetch(PUBLIC_MEMOS_URL);
  await assertApiResponseOk(response);
  const payload = (await response.json()) as unknown;
  if (!isPlainObject(payload) || !isPlainObject(payload.store)) {
    return {};
  }

  return payload.store as PublicMemoStore;
};

export const savePublicMemoStore = async (store: PublicMemoStore): Promise<PublicMemoStore> => {
  const response = await fetch(PUBLIC_MEMOS_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ store }),
  });

  await assertApiResponseOk(response);
  return store;
};

export const getPublicMemosForBook = async (bookId: string): Promise<PublicMemo[]> => {
  if (!bookId) {
    return [];
  }

  const response = await fetch(PUBLIC_MEMOS_FOR_BOOK_URL(bookId));
  if (response.status === 404) {
    return [];
  }

  await assertApiResponseOk(response);
  const payload = (await response.json()) as unknown;
  if (!isPlainObject(payload) || !Array.isArray(payload.memos)) {
    return [];
  }

  return payload.memos as PublicMemo[];
};
