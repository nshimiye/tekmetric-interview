import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import ContentContainer from '../components/layout/ContentContainer';
import ShelfCard from '../components/ShelfCard';
import SearchResultsPanel from './components/SearchResultsPanel';

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

function HomeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

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

      {savedBooks.length > 0 && (
        <Stack spacing={3}>
          <Typography variant="h4" component="h2">
            Your bookshelf
          </Typography>

          <ShelfGrid role="list" aria-label="Your saved books">
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

