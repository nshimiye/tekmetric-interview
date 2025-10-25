import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Button from './Button';
import { useAuth } from '../auth/AuthContext';
import { loadUserLibrary, saveUserLibrary } from '../library/libraryStorage';
import {
  loadPublicMemoStore,
  normalizePublicMemoStore,
  savePublicMemoStore,
} from '../library/publicMemoStorage';

const arePublicMemoListsEqual = (a = [], b = []) => {
  if (a === b) {
    return true;
  }

  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every((entry, index) => {
    const other = b[index];
    if (!other) {
      return false;
    }

    const entryAuthor = entry.author ?? {};
    const otherAuthor = other.author ?? {};

    return (
      entry.id === other.id &&
      entry.body === other.body &&
      entry.createdAt === other.createdAt &&
      entry.sharedAt === other.sharedAt &&
      (entryAuthor.id ?? null) === (otherAuthor.id ?? null) &&
      (entryAuthor.name ?? '') === (otherAuthor.name ?? '')
    );
  });
};

const arePublicStoresEqual = (a = {}, b = {}) => {
  if (a === b) {
    return true;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }

    return arePublicMemoListsEqual(a[key], b[key]);
  });
};

const createPublicMemoEntry = (memo, author) => {
  if (!memo || typeof memo !== 'object') {
    return null;
  }

  const { id, body, createdAt } = memo;
  if (typeof id !== 'string' || id.trim().length === 0) {
    return null;
  }

  const trimmedBody = typeof body === 'string' ? body.trim() : '';
  if (trimmedBody.length === 0) {
    return null;
  }

  const memoCreatedAt =
    typeof createdAt === 'string' && createdAt.trim().length > 0
      ? createdAt
      : new Date().toISOString();

  const authorId =
    author && typeof author.id === 'string' && author.id.trim().length > 0
      ? author.id.trim()
      : null;
  const authorName =
    author && typeof author.name === 'string' && author.name.trim().length > 0
      ? author.name.trim()
      : 'Anonymous reader';

  return {
    id: id.trim(),
    body: trimmedBody,
    createdAt: memoCreatedAt,
    author: { id: authorId, name: authorName },
    sharedAt: new Date().toISOString(),
  };
};

const MAX_RESULTS = 12;

const normalizeAuthors = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((author) => (typeof author === 'string' ? author.trim() : String(author ?? '').trim()))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }

  return [];
};

const normalizeBookForLibrary = (book) => {
  if (!book || !book.id) {
    return null;
  }

  const titleValue =
    typeof book.title === 'string' && book.title.trim().length > 0
      ? book.title.trim()
      : 'Untitled';

  return {
    id: String(book.id),
    title: titleValue,
    description: typeof book.description === 'string' ? book.description : '',
    authors: normalizeAuthors(book.authors ?? book.author),
    thumbnail:
      typeof book.thumbnail === 'string'
        ? book.thumbnail
        : typeof book.image === 'string'
          ? book.image
          : null,
    infoLink: typeof book.infoLink === 'string' ? book.infoLink : null,
    publishedDate: typeof book.publishedDate === 'string' ? book.publishedDate : null,
    source: typeof book.source === 'string' ? book.source : null,
  };
};

const areAuthorsEqual = (a = [], b = []) => {
  if (a === b) {
    return true;
  }

  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every((author, index) => author === b[index]);
};

const areBooksEqual = (a, b) => {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  if (
    a.id !== b.id ||
    a.title !== b.title ||
    a.description !== b.description ||
    a.thumbnail !== b.thumbnail ||
    a.infoLink !== b.infoLink ||
    a.publishedDate !== b.publishedDate ||
    a.source !== b.source
  ) {
    return false;
  }

  return areAuthorsEqual(a.authors, b.authors);
};

const mapVolumeToResult = (volume) => {
  const info = volume.volumeInfo ?? {};
  const fallbackId = `volume-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2, 10)}`;
  const generatedId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : fallbackId;

  return {
    id:
      volume.id ??
      info.industryIdentifiers?.[0]?.identifier ??
      generatedId,
    title: info.title ?? 'Untitled',
    authors: info.authors ?? [],
    description: info.description ?? '',
    thumbnail:
      info.imageLinks?.thumbnail ??
      info.imageLinks?.smallThumbnail ??
      null,
    infoLink: info.infoLink ?? info.canonicalVolumeLink ?? null,
    publishedDate: info.publishedDate ?? '',
    source: 'google-books',
  };
};

function AppShell() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const userId = user?.id ?? null;
  const [library, setLibrary] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const activeRequest = useRef(null);
  const [publicMemoStore, setPublicMemoStore] = useState(() =>
    loadPublicMemoStore(),
  );

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setLibrary({});
      return;
    }

    const storedLibrary = loadUserLibrary(userId);
    if (storedLibrary && typeof storedLibrary === 'object') {
      setLibrary(storedLibrary);
    } else {
      setLibrary({});
    }
  }, [isAuthenticated, userId]);

  const commitLibraryUpdate = useCallback(
    (producer) => {
      if (!isAuthenticated || !userId) {
        return;
      }

      setLibrary((prev) => {
        const next = producer(prev);
        if (next === prev) {
          return prev;
        }
        saveUserLibrary(userId, next);
        return next;
      });
    },
    [isAuthenticated, userId],
  );

  const commitPublicMemoUpdate = useCallback((producer) => {
    setPublicMemoStore((prevStore) => {
      const baseStore =
        prevStore && typeof prevStore === 'object' ? prevStore : {};
      const nextCandidate = producer(baseStore);
      if (nextCandidate === baseStore) {
        return baseStore;
      }

      const normalizedNext = normalizePublicMemoStore(nextCandidate);
      if (arePublicStoresEqual(baseStore, normalizedNext)) {
        return baseStore;
      }

      savePublicMemoStore(normalizedNext);
      return normalizedNext;
    });
  }, []);

  const publishMemo = useCallback(
    (bookId, memo, author) => {
      if (!bookId) {
        return;
      }

      commitPublicMemoUpdate((prevStore) => {
        const candidateEntry = createPublicMemoEntry(memo, author);
        if (!candidateEntry) {
          return prevStore;
        }

        const existingList = Array.isArray(prevStore[bookId])
          ? prevStore[bookId]
          : [];
        const existingEntry = existingList.find(
          (entry) => entry.id === candidateEntry.id,
        );

        const entryToPersist = existingEntry
          ? {
              ...candidateEntry,
              sharedAt: existingEntry.sharedAt ?? candidateEntry.sharedAt,
            }
          : candidateEntry;

        const nextList = existingEntry
          ? existingList.map((entry) =>
              entry.id === entryToPersist.id ? entryToPersist : entry,
            )
          : [...existingList, entryToPersist];

        return {
          ...prevStore,
          [bookId]: nextList,
        };
      });
    },
    [commitPublicMemoUpdate],
  );

  const unpublishMemo = useCallback(
    (bookId, memoId) => {
      if (!bookId || !memoId) {
        return;
      }

      commitPublicMemoUpdate((prevStore) => {
        const existingList = Array.isArray(prevStore[bookId])
          ? prevStore[bookId]
          : [];
        if (existingList.length === 0) {
          return prevStore;
        }

        const nextList = existingList.filter((entry) => entry.id !== memoId);
        if (nextList.length === existingList.length) {
          return prevStore;
        }

        if (nextList.length === 0) {
          const { [bookId]: _, ...rest } = prevStore;
          return rest;
        }

        return {
          ...prevStore,
          [bookId]: nextList,
        };
      });
    },
    [commitPublicMemoUpdate],
  );

  const ensureBookInLibrary = useCallback(
    (book) => {
      const normalized = normalizeBookForLibrary(book);
      if (!normalized) {
        return null;
      }

      commitLibraryUpdate((prev) => {
        const existing = prev[normalized.id];
        if (existing && areBooksEqual(existing.book, normalized)) {
          return prev;
        }

        const nextEntry = existing
          ? {
              book: {
                ...existing.book,
                ...normalized,
              },
              memos: existing.memos ?? [],
            }
          : {
              book: normalized,
              memos: [],
            };

        return {
          ...prev,
          [normalized.id]: nextEntry,
        };
      });

      return normalized;
    },
    [commitLibraryUpdate],
  );

  const updateBookMemos = useCallback(
    (book, memoUpdater) => {
      const normalized = ensureBookInLibrary(book);
      if (!normalized || typeof memoUpdater !== 'function') {
        return;
      }

      commitLibraryUpdate((prev) => {
        const existing = prev[normalized.id] ?? {
          book: normalized,
          memos: [],
        };
        const currentMemos = Array.isArray(existing.memos) ? existing.memos : [];
        const nextMemos = memoUpdater(currentMemos);
        if (nextMemos === currentMemos) {
          return prev;
        }

        return {
          ...prev,
          [normalized.id]: {
            book: existing.book,
            memos: nextMemos,
          },
        };
      });
    },
    [commitLibraryUpdate, ensureBookInLibrary],
  );

  const resetSearchState = () => {
    setSearchStatus('idle');
    setSearchResults([]);
    setSearchError(null);
    setLastSearchQuery('');
  };

  const clearSearch = () => {
    if (activeRequest.current) {
      activeRequest.current.abort();
      activeRequest.current = null;
    }

    setSearchTerm('');
    resetSearchState();
  };

  useEffect(
    () => () => {
      if (activeRequest.current) {
        activeRequest.current.abort();
      }
    },
    [],
  );

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    if (query.length === 0) {
      clearSearch();
      return;
    }

    if (activeRequest.current) {
      activeRequest.current.abort();
    }

    const controller = new AbortController();
    activeRequest.current = controller;

    setSearchStatus('loading');
    setSearchError(null);
    setLastSearchQuery(query);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query,
        )}&maxResults=${MAX_RESULTS}&printType=books`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error('Unable to fetch books right now.');
      }

      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];
      setSearchResults(items.map(mapVolumeToResult));
      setSearchStatus('success');
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }

      setSearchStatus('error');
      setSearchError(
        error.message ?? 'Something went wrong while searching for books.',
      );
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
      }
    }
  };

  const handleLogout = () => {
    logout();
    setLibrary({});
    setSearchTerm('');
    resetSearchState();
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: (theme) =>
            alpha(theme.palette.background.paper, 0.92),
          backdropFilter: 'blur(12px)',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="column"
            gap={3}
            py={3}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              gap={2}
            >
              <Typography
                component={Link}
                to="/"
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                }}
              >
                Book Memo
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={1}
              >
                {isAuthenticated ? (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ px: { sm: 1 } }}
                    >
                      Signed in as {user?.name}
                    </Typography>
                    <Button
                      variant="secondary"
                      onClick={handleLogout}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      variant="secondary"
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Sign in
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Create account
                    </Button>
                  </>
                )}
              </Stack>
            </Stack>

            {isAuthenticated && (
              <Box
                component="form"
                role="search"
                onSubmit={handleSearchSubmit}
                sx={{
                  ml: { md: 'auto' },
                  width: '100%',
                  maxWidth: 560,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <TextField
                  type="text"
                  name="query"
                  placeholder="Search books by title, author, or ISBN…"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  fullWidth
                  autoComplete="off"
                  inputProps={{
                    'aria-label': 'Search books',
                    inputMode: 'search',
                    role: 'searchbox',
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon aria-hidden="true" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={1}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <Button
                    type="submit"
                    startIcon={<SearchIcon fontSize="small" aria-hidden="true" />}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { sm: 130 },
                    }}
                  >
                    Search
                  </Button>

                  {searchStatus !== 'idle' && (
                    <Button
                      type="button"
                      variant="secondary"
                      startIcon={<ClearIcon fontSize="small" aria-hidden="true" />}
                      onClick={clearSearch}
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Clear
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        </Container>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: { xs: 6, sm: 8, md: 10 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Outlet
          context={{
            library,
            ensureBookInLibrary,
            updateBookMemos,
            publicMemos: publicMemoStore,
            publishPublicMemo: publishMemo,
            unpublishPublicMemo: unpublishMemo,
            search: {
              status: searchStatus,
              results: searchResults,
              error: searchError,
              lastQuery: lastSearchQuery,
              clearSearch,
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default AppShell;
