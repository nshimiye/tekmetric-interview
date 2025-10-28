import { randomUUID } from 'crypto';

const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes';
const MAX_GOOGLE_RESULTS = 7;

/**
 * Normalizes a query string for consistent cache keys
 * @param {string} value - The query string to normalize
 * @returns {string} The normalized query
 */
export const normalizeQuery = (value) => value.toLowerCase().trim();

/**
 * Resolves a user key for cache storage
 * @param {string} rawUserId - The raw user ID
 * @returns {string} The resolved user key
 */
export const resolveUserKey = (rawUserId) => {
  const userId = typeof rawUserId === 'string' ? rawUserId.trim() : '';
  return userId.length > 0 ? `user:${userId}` : 'guest';
};

/**
 * Maps a Google Books API volume to our normalized result format
 * @param {Object} volume - The volume object from Google Books API
 * @returns {Object} The normalized book result
 */
export const mapVolumeToResult = (volume = {}) => {
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

/**
 * Fetches books from Google Books API
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to fetch
 * @returns {Promise<Array>} Array of normalized book results
 */
export const fetchGoogleBooks = async (query, maxResults = MAX_GOOGLE_RESULTS) => {
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

/**
 * Handles the search API request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Function} readSearchCacheStore - Function to read the search cache
 * @param {Function} writeSearchCacheStore - Function to write the search cache
 */
export const handleSearch = async (req, res, next, readSearchCacheStore, writeSearchCacheStore) => {
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
};

/**
 * Handles the cache deletion API request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Function} readSearchCacheStore - Function to read the search cache
 * @param {Function} writeSearchCacheStore - Function to write the search cache
 */
export const handleClearCache = async (req, res, next, readSearchCacheStore, writeSearchCacheStore) => {
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
};

export { MAX_GOOGLE_RESULTS };

