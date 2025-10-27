import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ShelfCard from '../../components/cards/ShelfCard';
import SearchResultsPanel from '../components/SearchResultsPanel';
import BookSearchForm from '../../components/BookSearchForm';
import { useHomeScreen } from './hooks';
import {
  StyledContentContainer,
  ShelfGrid,
  WelcomeSection,
  WelcomeTitle,
  WelcomeMessage,
} from './styles';

function HomeScreen() {
  const { t } = useTranslation();
  
  const {
    savedBooks,
    savedBookIds,
    lastSearchQuery,
    welcomeSearchTerm,
    handleAddMemoFromSearch,
    handleAddToShelfFromSearch,
    handleNavigateToBook,
    handleWelcomeSearchChange,
    handleWelcomeSearchSubmit,
  } = useHomeScreen();

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

