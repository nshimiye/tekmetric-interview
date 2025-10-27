import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

const app = express();
const PORT = Number.parseInt(process.env.PORT ?? '3001', 10);
const DEFAULT_LATENCY_MS = Number.parseInt(process.env.SIMULATED_LATENCY_MS ?? '0', 10);
const FAILURE_RATE = Number.parseFloat(process.env.SIMULATED_FAILURE_RATE ?? '0');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
const LIBRARY_FILE = path.join(DATA_DIR, 'library.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const PUBLIC_MEMOS_FILE = path.join(DATA_DIR, 'publicMemos.json');
const SEARCH_CACHE_FILE = path.join(DATA_DIR, 'searchCache.json');
const DEFAULT_LIBRARY_STORE = {};
const DEFAULT_AUTH_STORE = { users: [], currentUser: null };
const DEFAULT_PUBLIC_MEMO_STORE = {};
const DEFAULT_SEARCH_CACHE_STORE = {};
const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes';
const MAX_GOOGLE_RESULTS = 7;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cloneDefault = (value) => JSON.parse(JSON.stringify(value));

async function ensureFile(filePath, defaultValue) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

async function readJsonFile(filePath, defaultValue) {
  await ensureFile(filePath, defaultValue);
  const raw = await fs.readFile(filePath, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fall through to reset file if parse fails
  }
  await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  return cloneDefault(defaultValue);
}

async function writeJsonFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

const readLibraryStore = () => readJsonFile(LIBRARY_FILE, DEFAULT_LIBRARY_STORE);
const writeLibraryStore = (store) => writeJsonFile(LIBRARY_FILE, store);

const readAuthStore = () => readJsonFile(AUTH_FILE, DEFAULT_AUTH_STORE);
const writeAuthStore = (store) => writeJsonFile(AUTH_FILE, store);

const readPublicMemoStore = () => readJsonFile(PUBLIC_MEMOS_FILE, DEFAULT_PUBLIC_MEMO_STORE);
const writePublicMemoStore = (store) => writeJsonFile(PUBLIC_MEMOS_FILE, store);
const readSearchCacheStore = () => readJsonFile(SEARCH_CACHE_FILE, DEFAULT_SEARCH_CACHE_STORE);
const writeSearchCacheStore = (store) => writeJsonFile(SEARCH_CACHE_FILE, store);

const resolveUserKey = (rawUserId) => {
  const userId = typeof rawUserId === 'string' ? rawUserId.trim() : '';
  return userId.length > 0 ? `user:${userId}` : 'guest';
};

const normalizeQuery = (value) => value.toLowerCase().trim();

const mapVolumeToResult = (volume = {}) => {
  const info = volume && typeof volume === 'object' && volume.volumeInfo ? volume.volumeInfo : {};
  const fallbackId = `volume-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const idFromVolume = typeof volume.id === 'string' && volume.id.trim().length > 0 ? volume.id.trim() : '';
  const idFromIdentifiers = Array.isArray(info.industryIdentifiers)
    ? info.industryIdentifiers
        .map((identifier) => (identifier && typeof identifier.identifier === 'string' ? identifier.identifier.trim() : ''))
        .find((identifier) => identifier.length > 0) ?? ''
    : '';
  const generatedId = typeof randomUUID === 'function' ? randomUUID() : fallbackId;
  const id = idFromVolume || idFromIdentifiers || generatedId;

  const title =
    typeof info.title === 'string' && info.title.trim().length > 0 ? info.title : 'Untitled';
  const authors = Array.isArray(info.authors)
    ? info.authors.filter((name) => typeof name === 'string' && name.trim().length > 0)
    : [];
  const description =
    typeof info.description === 'string' ? info.description : '';

  const imageLinks = info && typeof info.imageLinks === 'object' && !Array.isArray(info.imageLinks)
    ? info.imageLinks
    : {};
  const thumbnail =
    typeof imageLinks.thumbnail === 'string'
      ? imageLinks.thumbnail
      : typeof imageLinks.smallThumbnail === 'string'
        ? imageLinks.smallThumbnail
        : null;

  const infoLink =
    typeof info.infoLink === 'string'
      ? info.infoLink
      : typeof info.canonicalVolumeLink === 'string'
        ? info.canonicalVolumeLink
        : null;
  const publishedDate = typeof info.publishedDate === 'string' ? info.publishedDate : '';

  return {
    id,
    title,
    authors,
    description,
    thumbnail,
    infoLink,
    publishedDate,
    source: 'google-books',
  };
};

const fetchGoogleBooks = async (query, maxResults = MAX_GOOGLE_RESULTS) => {
  const url = new URL(GOOGLE_BOOKS_ENDPOINT);
  url.searchParams.set('q', query);
  url.searchParams.set('printType', 'books');
  url.searchParams.set('maxResults', Number.isFinite(maxResults) ? String(maxResults) : String(MAX_GOOGLE_RESULTS));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to fetch books right now.');
  }

  const payload = await response.json();
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return items.map((volume) => mapVolumeToResult(volume));
};

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  const delayQuery = Number.parseInt(req.query.delay, 10);
  const delay =
    Number.isFinite(delayQuery) && delayQuery >= 0 ? delayQuery : Math.max(DEFAULT_LATENCY_MS, 0);
  if (delay > 0) {
    await sleep(delay);
  }

  const shouldFail =
    req.query.fail === 'true' ||
    (Number.isFinite(FAILURE_RATE) && FAILURE_RATE > 0 && Math.random() < FAILURE_RATE);

  if (shouldFail) {
    res.status(503).json({ message: 'Simulated failure' });
    return;
  }

  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/library/:userId', async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {
    const store = await readLibraryStore();
    const library = store[userId] ?? {};
    res.json({ library });
  } catch (error) {
    next(error);
  }
});

app.put('/api/library/:userId', async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  const { library } = req.body ?? {};

  try {
    const store = await readLibraryStore();
    store[userId] = library ?? {};
    await writeLibraryStore(store);
    res.json({ library: store[userId] });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/users', async (_req, res, next) => {
  try {
    const store = await readAuthStore();
    const users = Array.isArray(store.users) ? store.users : [];
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

app.put('/api/auth/users', async (req, res, next) => {
  const { users } = req.body ?? {};

  try {
    const store = await readAuthStore();
    store.users = Array.isArray(users) ? users : [];
    await writeAuthStore(store);
    res.json({ users: store.users });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/session', async (_req, res, next) => {
  try {
    const store = await readAuthStore();
    res.json({ user: store.currentUser ?? null });
  } catch (error) {
    next(error);
  }
});

app.put('/api/auth/session', async (req, res, next) => {
  const { user } = req.body ?? {};

  try {
    const store = await readAuthStore();
    store.currentUser = user ?? null;
    await writeAuthStore(store);
    res.json({ user: store.currentUser });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/auth/session', async (_req, res, next) => {
  try {
    const store = await readAuthStore();
    store.currentUser = null;
    await writeAuthStore(store);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/public-memos', async (_req, res, next) => {
  try {
    const store = await readPublicMemoStore();
    res.json({ store });
  } catch (error) {
    next(error);
  }
});

app.put('/api/public-memos', async (req, res, next) => {
  const { store } = req.body ?? {};

  try {
    const payload = store && typeof store === 'object' ? store : {};
    await writePublicMemoStore(payload);
    res.json({ store: payload });
  } catch (error) {
    next(error);
  }
});

app.get('/api/public-memos/:bookId', async (req, res, next) => {
  const { bookId } = req.params;
  if (!bookId) {
    res.status(400).json({ message: 'Book ID is required' });
    return;
  }

  try {
    const store = await readPublicMemoStore();
    if (!(bookId in store)) {
      res.status(404).json({ message: 'No public memos for that book' });
      return;
    }

    const memos = Array.isArray(store[bookId]) ? store[bookId] : [];
    res.json({ memos });
  } catch (error) {
    next(error);
  }
});

app.get('/api/search', async (req, res, next) => {
  const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
  const query = rawQuery.trim();
  if (!query) {
    res.status(400).json({ message: 'Query parameter "q" is required' });
    return;
  }

  const normalizedQuery = normalizeQuery(query);
  const userKey = resolveUserKey(req.query.userId);
  const skipCache = req.query.skipCache === 'true';
  const requestedMaxResults = Number.parseInt(req.query.maxResults, 10);
  const maxResults = Number.isFinite(requestedMaxResults) && requestedMaxResults > 0
    ? requestedMaxResults
    : MAX_GOOGLE_RESULTS;

  try {
    const cacheStore = await readSearchCacheStore();
    const userCache = cacheStore[userKey] && typeof cacheStore[userKey] === 'object'
      ? cacheStore[userKey]
      : {};

    if (!skipCache) {
      const cachedEntry = userCache[normalizedQuery];
      if (cachedEntry && Array.isArray(cachedEntry.results)) {
        res.json({
          query,
          results: cachedEntry.results,
          fromCache: true,
          cachedAt: cachedEntry.cachedAt ?? null,
        });
        return;
      }
    }

    const results = await fetchGoogleBooks(query, maxResults);
    const nextUserCache = {
      ...userCache,
      [normalizedQuery]: {
        results,
        cachedAt: new Date().toISOString(),
      },
    };
    cacheStore[userKey] = nextUserCache;
    await writeSearchCacheStore(cacheStore);

    res.json({
      query,
      results,
      fromCache: false,
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/search/cache', async (req, res, next) => {
  const userKey = resolveUserKey(req.query.userId);
  const hasUserParam = typeof req.query.userId === 'string' && req.query.userId.trim().length > 0;
  const rawQuery = typeof req.query.query === 'string' ? req.query.query : '';
  const normalizedQuery = normalizeQuery(rawQuery);

  try {
    const cacheStore = await readSearchCacheStore();
    if (hasUserParam) {
      const userCache = cacheStore[userKey];
      if (userCache && typeof userCache === 'object') {
        if (normalizedQuery) {
          delete userCache[normalizedQuery];
        } else {
          cacheStore[userKey] = {};
        }
      }
    } else {
      if (normalizedQuery) {
        Object.keys(cacheStore).forEach((key) => {
          if (cacheStore[key] && typeof cacheStore[key] === 'object') {
            delete cacheStore[key][normalizedQuery];
          }
        });
      } else {
        Object.keys(cacheStore).forEach((key) => {
          cacheStore[key] = {};
        });
      }
    }

    await writeSearchCacheStore(cacheStore);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Library API server listening on http://localhost:${PORT}`);
});
