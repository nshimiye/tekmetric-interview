import { useEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
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

const MAX_RESULTS = 12;

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
  };
};

function AppShell() {
  const [memos, setMemos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const activeRequest = useRef(null);

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
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            gap={3}
            py={3}
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
            memos,
            setMemos,
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
