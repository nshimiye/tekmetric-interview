import { API_BASE_URL, assertApiResponseOk, isPlainObject } from '../api/client';

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

const normalizeStore = (value: unknown): PublicMemoStore => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value).reduce<PublicMemoStore>((acc, [bookId, entries]) => {
    if (!bookId || !Array.isArray(entries)) {
      return acc;
    }

    const normalizedEntries = entries
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }

        const { id, body, createdAt, author, sharedAt } = entry as Record<string, unknown>;
        const memoId =
          typeof id === 'string' && id.trim().length > 0 ? id.trim() : null;
        const memoBody =
          typeof body === 'string' && body.trim().length > 0
            ? body.trim()
            : null;
        const memoCreatedAt =
          typeof createdAt === 'string' && createdAt.trim().length > 0
            ? createdAt
            : null;

        if (!memoId || !memoBody || !memoCreatedAt) {
          return null;
        }

        const normalizedAuthor: MemoAuthor =
          author && typeof author === 'object' && 'id' in author && 'name' in author
            ? {
                id:
                  typeof author.id === 'string' && author.id.trim().length > 0
                    ? author.id.trim()
                    : null,
                name:
                  typeof author.name === 'string' && author.name.trim().length > 0
                    ? author.name.trim()
                    : 'Anonymous reader',
              }
            : {
                id: null,
                name: 'Anonymous reader',
              };

        return {
          id: memoId,
          body: memoBody,
          createdAt: memoCreatedAt,
          author: normalizedAuthor,
          sharedAt:
            typeof sharedAt === 'string' && sharedAt.trim().length > 0
              ? sharedAt
              : memoCreatedAt,
        };
      })
      .filter((entry): entry is PublicMemo => entry !== null);

    if (normalizedEntries.length === 0) {
      return acc;
    }

    acc[bookId] = normalizedEntries;
    return acc;
  }, {});
};

export const loadPublicMemoStore = async (): Promise<PublicMemoStore> => {
  const response = await fetch(PUBLIC_MEMOS_URL);
  await assertApiResponseOk(response);
  const payload = (await response.json()) as unknown;
  if (!isPlainObject(payload)) {
    return {};
  }

  return normalizeStore(payload.store);
};

export const normalizePublicMemoStore = normalizeStore;

export const savePublicMemoStore = async (store: PublicMemoStore): Promise<PublicMemoStore> => {
  const normalized = normalizeStore(store);
  const response = await fetch(PUBLIC_MEMOS_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ store: normalized }),
  });

  await assertApiResponseOk(response);
  return normalized;
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

  const normalizedStore = normalizeStore({ [bookId]: payload.memos });
  return Array.isArray(normalizedStore[bookId]) ? normalizedStore[bookId] : [];
};
