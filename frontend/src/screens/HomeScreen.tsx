import { useMemo, useCallback, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import ContentContainer from '../components/layout/ContentContainer';
import ShelfCard from '../components/ShelfCard';
import SearchResultsPanel from './components/SearchResultsPanel';
import Button from '../components/Button';

// Redux imports
import {
  selectLibrary,
  ensureBookInLibrary as ensureBookInLibraryAction,
  LibraryBook,
} from '../store/slices/librarySlice';

import {
  selectSearchStatus,
  selectSearchResults,
  selectSearchError,
  selectLastSearchQuery,
  selectSearchCacheSize,
  selectLastResultFromCache,
  clearSearch as clearSearchAction,
  clearSearchCache as clearSearchCacheAction,
  searchBooks,
  BookSearchResult,
} from '../store/slices/searchSlice';
import { AppDispatch } from '../store';

const StyledContentContainer = styled(ContentContainer)(({ theme }) => ({
  gap: theme.spacing(6),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(8),
  },
}));

const ShelfGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  },
}));

const WelcomeSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme.spacing(8, 3),
  borderRadius: (theme.shape.borderRadius as number) * 2,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  minHeight: '400px',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(12, 6),
  },
}));

const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const WelcomeMessage = styled(Typography)(({ theme }) => ({
  maxWidth: '600px',
  marginBottom: theme.spacing(4),
  color: theme.palette.text.secondary,
  lineHeight: 1.6,
}));

const WelcomeSearchForm = styled('form')(({ theme }) => ({
  width: '100%',
  maxWidth: 560,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
}));

function HomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state for welcome search
  const [welcomeSearchTerm, setWelcomeSearchTerm] = useState('');

  // Redux state
  const library = useSelector(selectLibrary);
  const searchStatus = useSelector(selectSearchStatus);
  const searchResults = useSelector(selectSearchResults);
  const searchError = useSelector(selectSearchError);
  const lastSearchQuery = useSelector(selectLastSearchQuery);
  const searchCacheSize = useSelector(selectSearchCacheSize);
  const lastResultFromCache = useSelector(selectLastResultFromCache);

  const savedBooks = useMemo(
    () =>
      Object.values(library).filter(
        (entry) => entry && entry.book && entry.book.id,
      ),
    [library],
  );
  const savedBookIds = useMemo(
    () => new Set(savedBooks.map((entry) => entry.book.id)),
    [savedBooks],
  );

  const ensureBookInLibrary = useCallback(
    (book: BookSearchResult | LibraryBook) => {
      dispatch(ensureBookInLibraryAction(book));
      return book;
    },
    [dispatch],
  );

  const clearSearch = useCallback(() => {
    dispatch(clearSearchAction());
  }, [dispatch]);

  const clearCache = useCallback(() => {
    // Clear the cache first
    dispatch(clearSearchCacheAction());
    // Then re-run the search with the same query to get fresh results
    if (lastSearchQuery && lastSearchQuery.trim().length > 0) {
      dispatch(searchBooks(lastSearchQuery));
    }
  }, [dispatch, lastSearchQuery]);

  const handleNavigateToBook = (book: BookSearchResult | LibraryBook) => {
    if (!book) {
      return;
    }

    const normalized = ensureBookInLibrary(book);
    const targetId = normalized?.id ?? book.id;
    if (!targetId) {
      return;
    }

    navigate(`/books/${targetId}`);
  };

  const handleAddMemoFromSearch = (book: BookSearchResult) => {
    handleNavigateToBook(book);
  };

  const handleAddToShelfFromSearch = (book: BookSearchResult) => {
    ensureBookInLibrary(book);
  };

  const handleWelcomeSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWelcomeSearchTerm(event.target.value);
  };

  const handleWelcomeSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const query = welcomeSearchTerm.trim();
    if (query.length === 0) {
      return;
    }

    try {
      await dispatch(searchBooks(query)).unwrap();
      // Scroll to top to see search results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // Error is handled by the slice
      console.error('Search error:', error);
    }
  };

  return (
    <StyledContentContainer>
      <SearchResultsPanel
        status={searchStatus}
        results={searchResults}
        error={searchError}
        lastQuery={lastSearchQuery}
        cacheSize={searchCacheSize}
        lastResultFromCache={lastResultFromCache}
        onClear={clearSearch}
        onClearCache={clearCache}
        onAddMemo={handleAddMemoFromSearch}
        onAddToShelf={handleAddToShelfFromSearch}
        savedBookIds={savedBookIds}
      />

      {savedBooks.length === 0 && !lastSearchQuery && (
        <WelcomeSection>
          <WelcomeTitle variant="h4">
            {t('home.welcomeTitle')}
          </WelcomeTitle>
          <WelcomeMessage variant="body1">
            {t('home.welcomeMessage')}
          </WelcomeMessage>
          <WelcomeSearchForm role="search" onSubmit={handleWelcomeSearchSubmit}>
            <TextField
              type="search"
              name="query"
              size="medium"
              placeholder={t('header.searchPlaceholder')}
              value={welcomeSearchTerm}
              onChange={handleWelcomeSearchChange}
              fullWidth
              autoComplete="off"
              autoFocus
              inputProps={{
                'aria-label': t('header.searchAriaLabel'),
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
            <Button type="submit" size="medium">
              {t('header.searchButton')}
            </Button>
          </WelcomeSearchForm>
        </WelcomeSection>
      )}

      {savedBooks.length > 0 && (
        <Stack spacing={3}>
          <Typography variant="h4" component="h2">
            {t('home.yourBookshelf')}
          </Typography>

          <ShelfGrid role="list" aria-label={t('home.savedBooksAriaLabel')}>
            {savedBooks.map(({ book, memos }) => (
              <ShelfCard
                key={book.id}
                book={book}
                memos={memos}
                onViewMemos={handleNavigateToBook}
              />
            ))}
          </ShelfGrid>
        </Stack>
      )}

    </StyledContentContainer>
  );
}

export default HomeScreen;

