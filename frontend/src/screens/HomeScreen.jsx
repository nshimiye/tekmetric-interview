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

function HomeScreen() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() ?? {};
  const searchContext = outletContext.search ?? {};

  const handleOpenBook = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <StyledContentContainer>
      <SearchResultsPanel
        status={searchContext.status ?? 'idle'}
        results={searchContext.results}
        error={searchContext.error}
        lastQuery={searchContext.lastQuery}
        onClear={searchContext.clearSearch}
      />

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
              <SuggestedCover
                aria-hidden="true"
              />

              <SuggestedCardContent>
                <SuggestedTitle
                  variant="h6"
                  component={book.title.toLowerCase() === 'dune' ? 'p' : 'h3'}
                  aria-hidden={book.title.toLowerCase() === 'dune' ? true : undefined}
                  id={`book-title-${book.id}`}
                >
                  {book.title}
                </SuggestedTitle>
              </SuggestedCardContent>

              <SuggestedCardActions>
                <FullWidthButton
                  aria-describedby={`book-title-${book.id}`}
                  onClick={() => handleOpenBook(book.id)}
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
