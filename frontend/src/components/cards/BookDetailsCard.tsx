import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import {
  BookInfoCard,
  BookCover,
  BookCoverImage,
} from '../../screens/book-memo-screen/components/BookMemoScreen.styles';
import type { LibraryBook } from '../../store/slices/librarySlice';
import { useTranslation } from 'react-i18next';

const TruncatedDescription = styled(Typography)(() => ({
  display: '-webkit-box',
  WebkitLineClamp: 5,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}));

interface BookDetailsCardProps {
  book: LibraryBook | null;
}

function BookDetailsCard({ book }: BookDetailsCardProps) {
  const { t } = useTranslation();
  const authorsLabel = useMemo(() => {
    if (!book) {
      return '';
    }
    const libraryBook = book;
    if (Array.isArray(libraryBook.authors) && libraryBook.authors.length > 0) {
      return libraryBook.authors.join(', ');
    }
    return '';
  }, [book]);

  const coverImage =
    book && typeof (book as LibraryBook).thumbnail === 'string' ? (book as LibraryBook).thumbnail : null;

  if (!book) {
    return null;
  }

  return (
    <BookInfoCard variant="outlined">
      <Typography variant="overline" color="text.secondary">
        {t('book.details')}
      </Typography>
      <BookCover aria-hidden={!coverImage} hasImage={Boolean(coverImage)}>
        {coverImage ? (
          <BookCoverImage
            src={coverImage}
            alt={`Cover of ${book.title}`}
            loading="lazy"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('book.coverUnavailable')}
          </Typography>
        )}
      </BookCover>
      <Stack spacing={0.5}>
        <Typography variant="h6" component="h2">
          {book.title}
        </Typography>
        {authorsLabel && (
          <Typography variant="body2" color="text.secondary">
            {t('book.by')} {authorsLabel}
          </Typography>
        )}
      </Stack>
      {book.description && (
        <TruncatedDescription
          variant="body2"
          color="text.secondary"
        >
          {book.description}
        </TruncatedDescription>
      )}
    </BookInfoCard>
  );
}

export default BookDetailsCard;

