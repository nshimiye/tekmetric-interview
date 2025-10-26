import { safeRead, safeRemove, safeWrite } from '../storage/localStorageUtils';

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

const PUBLIC_MEMOS_KEY = 'bookmemo_public_memos';

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
          author && typeof author === 'object'
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

export const loadPublicMemoStore = (): PublicMemoStore => {
  const stored = safeRead<unknown>(PUBLIC_MEMOS_KEY, {});
  return normalizeStore(stored);
};

export const normalizePublicMemoStore = normalizeStore;

const persistStore = (store: PublicMemoStore): PublicMemoStore => {
  const normalized = normalizeStore(store);
  if (Object.keys(normalized).length === 0) {
    safeRemove(PUBLIC_MEMOS_KEY);
    return normalized;
  }

  safeWrite(PUBLIC_MEMOS_KEY, normalized);
  return normalized;
};

export const savePublicMemoStore = (store: PublicMemoStore): PublicMemoStore => persistStore(store);

export const getPublicMemosForBook = (bookId: string): PublicMemo[] => {
  if (!bookId) {
    return [];
  }

  const store = loadPublicMemoStore();
  return Array.isArray(store[bookId]) ? store[bookId] : [];
};

