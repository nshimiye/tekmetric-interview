import { API_BASE_URL } from './client';

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

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

export interface PublicMemosResponse {
  memos: PublicMemo[];
  pagination: PaginationInfo;
}

export type PublicMemoStore = Record<string, PublicMemo[]>;

const PUBLIC_MEMOS_URL = `${API_BASE_URL}/public-memos`;
const PUBLIC_MEMOS_FOR_BOOK_URL = (bookId: string, page?: number, limit?: number): string => {
  const url = `${PUBLIC_MEMOS_URL}/${encodeURIComponent(bookId)}`;
  if (page !== undefined && limit !== undefined) {
    return `${url}?page=${page}&limit=${limit}`;
  }
  return url;
};

export const loadPublicMemoStore = async (): Promise<PublicMemoStore> => {
  const response = await fetch(PUBLIC_MEMOS_URL);
  const payload = (await response.json()) as { store: PublicMemoStore };

  return payload.store;
};

export const savePublicMemoStore = async (store: PublicMemoStore): Promise<PublicMemoStore> => {
  await fetch(PUBLIC_MEMOS_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ store }),
  });

  return store;
};

export const getPublicMemosForBook = async (
  bookId: string,
  page: number = 1,
  limit: number = 100
): Promise<PublicMemosResponse> => {
  const response = await fetch(PUBLIC_MEMOS_FOR_BOOK_URL(bookId, page, limit));
  if (response.status === 404) {
    throw new Error('Book memos not found');
  }
  if (response.status === 500) {
    throw new Error('We are having trouble loading the memos right now. Please try again later.');
  }
  const payload = (await response.json()) as any;

  return {
    memos: payload.memos as PublicMemo[],
    pagination: payload.pagination as unknown as PaginationInfo
  };
};
