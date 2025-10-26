import { useMemo, useCallback, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled, alpha } from '@mui/material/styles';
import ContentContainer from '../components/layout/ContentContainer';
import ShelfCard from '../components/ShelfCard';
import SearchResultsPanel from './components/SearchResultsPanel';
import BookSearchForm from '../components/BookSearchForm';

// Redux imports
import {
  selectLibrary,
  ensureBookInLibrary as ensureBookInLibraryAction,
  LibraryBook,
} from '../store/slices/librarySlice';

import {
  selectLastSearchQuery,
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

function HomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state for welcome search
  const [welcomeSearchTerm, setWelcomeSearchTerm] = useState('');

  // Redux state
  const library = useSelector(selectLibrary);
  const lastSearchQuery = useSelector(selectLastSearchQuery);

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
          <BookSearchForm
            searchTerm={welcomeSearchTerm}
            onSearchTermChange={handleWelcomeSearchChange}
            onSubmit={handleWelcomeSearchSubmit}
            size="medium"
            autoFocus
          />
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

