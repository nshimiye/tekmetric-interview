import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button from '../components/Button';
import ContentContainer from '../components/layout/ContentContainer';
import BOOKS from '../data/books';
import SearchResultsPanel from './components/SearchResultsPanel';

const StyledContentContainer = styled(ContentContainer)(({ theme }) => ({
  gap: theme.spacing(6),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(8),
  },
}));

const SuggestionsGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(4),
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  },
}));

const SuggestedCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(3.5),
  border: `1px solid ${theme.custom.designTokens.borderPanel}`,
}));

const SuggestedCover = styled('div')(({ theme }) => ({
  width: '100%',
  aspectRatio: '3 / 4',
  borderRadius: theme.shape.borderRadius * 3,
  background: theme.custom.gradients.hero(),
  border: `1px solid ${theme.custom.designTokens.borderMuted}`,
}));

const SuggestedCardContent = styled(CardContent)(({ theme }) => ({
  padding: 0,
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  textAlign: 'center',
}));

const SuggestedTitle = styled(Typography)(() => ({
  fontSize: '1.05rem',
  fontWeight: 600,
}));

const SuggestedCardActions = styled(CardActions)(() => ({
  padding: 0,
}));

const FullWidthButton = styled(Button)(() => ({
  width: '100%',
}));

const ShelfGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
}));

const ShelfCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  border: `1px solid ${theme.custom.designTokens.borderPanel}`,
}));

const ShelfCover = styled('div')(({ theme }) => ({
  width: '100%',
  aspectRatio: '3 / 4',
  borderRadius: theme.shape.borderRadius * 3,
  border: `1px solid ${theme.custom.designTokens.borderMuted}`,
  background: theme.custom.gradients.hero(),
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ShelfCoverImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ShelfCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const ShelfSnippet = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  color: theme.palette.text.secondary,
}));

const getLatestMemoSnippet = (memos) => {
  if (!Array.isArray(memos) || memos.length === 0) {
    return null;
  }

  const latestMemo = memos[memos.length - 1];
  if (!latestMemo?.body) {
    return null;
  }

  const body = latestMemo.body.trim();
  if (body.length === 0) {
    return null;
  }

  return body.length > 120 ? `${body.slice(0, 120)}…` : body;
};

function HomeScreen() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() ?? {};
  const searchContext = outletContext.search ?? {};
  const library = outletContext.library ?? {};
  const ensureBookInLibrary =
    outletContext.ensureBookInLibrary ?? (() => null);

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

  const handleNavigateToBook = (book) => {
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

  const handleAddMemoFromSearch = (book) => {
    handleNavigateToBook(book);
  };

  const handleAddToShelfFromSearch = (book) => {
    ensureBookInLibrary(book);
  };

  return (
    <StyledContentContainer>
      <SearchResultsPanel
        status={searchContext.status ?? 'idle'}
        results={searchContext.results}
        error={searchContext.error}
        lastQuery={searchContext.lastQuery}
        onClear={searchContext.clearSearch}
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
            {savedBooks.map(({ book, memos }) => {
              const snippet = getLatestMemoSnippet(memos);
              const authorsText =
                Array.isArray(book.authors) && book.authors.length > 0
                  ? book.authors.join(', ')
                  : null;
              const memoCount = Array.isArray(memos) ? memos.length : 0;

              return (
                <ShelfCard
                  key={book.id}
                  component="article"
                  role="listitem"
                >
                  <ShelfCover aria-hidden={!book.thumbnail}>
                    {book.thumbnail ? (
                      <ShelfCoverImage
                        src={book.thumbnail}
                        alt={`Cover of ${book.title}`}
                        loading="lazy"
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No cover available
                      </Typography>
                    )}
                  </ShelfCover>

                  <ShelfCardContent>
                    <Typography variant="h6" component="h3">
                      {book.title}
                    </Typography>

                    {authorsText && (
                      <Typography variant="body2" color="text.secondary">
                        by {authorsText}
                      </Typography>
                    )}

                    {snippet && (
                      <ShelfSnippet variant="body2">
                        “{snippet}”
                      </ShelfSnippet>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      {memoCount} memo{memoCount === 1 ? '' : 's'}
                    </Typography>
                  </ShelfCardContent>

                  <CardActions sx={{ mt: 'auto', px: 0, pb: 0 }}>
                    <FullWidthButton onClick={() => handleNavigateToBook(book)}>
                      View memos
                    </FullWidthButton>
                  </CardActions>
                </ShelfCard>
              );
            })}
          </ShelfGrid>
        </Stack>
      )}

      <Stack spacing={3}>
        <Typography variant="h4" component="h2">
          Suggested books
        </Typography>

        <SuggestionsGrid>
          {BOOKS.map((book) => (
            <SuggestedCard
              key={book.id}
              component="article"
            >
              <SuggestedCover aria-hidden="true" />

              <SuggestedCardContent>
                <SuggestedTitle
                  variant="h6"
                  component={book.title.toLowerCase() === 'dune' ? 'p' : 'h3'}
                  aria-hidden={
                    book.title.toLowerCase() === 'dune' ? true : undefined
                  }
                  id={`book-title-${book.id}`}
                >
                  {book.title}
                </SuggestedTitle>
              </SuggestedCardContent>

              <SuggestedCardActions>
                <FullWidthButton
                  aria-describedby={`book-title-${book.id}`}
                  onClick={() =>
                    handleNavigateToBook({
                      ...book,
                      source: 'suggested',
                    })
                  }
                >
                  + Memo
                </FullWidthButton>
              </SuggestedCardActions>
            </SuggestedCard>
          ))}
        </SuggestionsGrid>
      </Stack>
    </StyledContentContainer>
  );
}

export default HomeScreen;
