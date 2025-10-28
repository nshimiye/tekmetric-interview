import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { handleSearch, handleClearCache } from './searchService.js';

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


// Mock login endpoint
app.post('/api/auth/login', async (req, res, next) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }
  try {
    const store = await readAuthStore();
    const users = Array.isArray(store.users) ? store.users : [];
    const normalizedEmail = email.trim().toLowerCase();
    const match = users.find(
      (u) => u.email.trim().toLowerCase() === normalizedEmail && u.password === password
    );
    if (!match) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }
    store.currentUser = { id: match.id, name: match.name, email: match.email };
    await writeAuthStore(store);
    res.json({ user: store.currentUser });
  } catch (error) {
    next(error);
  }
});

// Mock register endpoint
app.post('/api/auth/register', async (req, res, next) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Name, email, and password are required.' });
    return;
  }
  try {
    const store = await readAuthStore();
    const users = Array.isArray(store.users) ? store.users : [];
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.trim().toLowerCase() === normalizedEmail)) {
      res.status(409).json({ message: 'An account with that email already exists.' });
      return;
    }
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
    };
    users.push(newUser);
    store.users = users;
    store.currentUser = { id: newUser.id, name: newUser.name, email: newUser.email };
    await writeAuthStore(store);
    res.json({ user: store.currentUser });
  } catch (error) {
    next(error);
  }
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
  const page = Number.parseInt(req.query.page ?? '1', 10);
  const limit = Number.parseInt(req.query.limit ?? '100', 10);

  try {
    const store = await readPublicMemoStore();
    // if SIMULATE_MANY_MEMOS is true, simulate many memos by creating new memos randomly for the book
    if (process.env.SIMULATE_MANY_MEMOS === 'true') {
      const newMemos = [];
      for (let i = 0; i < 100; i++) {
        newMemos.push({ id: `new-memo-${i}`, body: `New memo ${i}`, createdAt: new Date().toISOString(), sharedAt: new Date('2025-09-09').toISOString(), author: { id: '1', name: 'John Doe' } });
      }
      store[bookId] = [...(store[bookId] ?? []), ...newMemos];
    }
    if (!(bookId in store)) {
      res.json({ 
        memos: [], 
        pagination: {
          page,
          limit,
          totalCount: 0,
          hasMore: false
        }
      });
      return;
    }

    const allMemos = Array.isArray(store[bookId]) ? store[bookId] : [];
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const memos = allMemos.slice(startIndex, endIndex);
    const totalCount = allMemos.length;
    const hasMore = endIndex < totalCount;

    res.json({ 
      memos, 
      pagination: {
        page,
        limit,
        totalCount,
        hasMore
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/search', async (req, res, next) => {
  await handleSearch(req, res, next, readSearchCacheStore, writeSearchCacheStore);
});

app.delete('/api/search/cache', async (req, res, next) => {
  await handleClearCache(req, res, next, readSearchCacheStore, writeSearchCacheStore);
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Library API server listening on http://localhost:${PORT}`);
});
