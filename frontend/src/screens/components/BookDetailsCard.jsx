import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  BookInfoCard,
  BookCover,
  BookCoverImage,
} from './BookMemoScreen.styles';

function BookDetailsCard({ book }) {
  const authorsLabel = useMemo(() => {
    if (!book) {
      return '';
    }
    if (Array.isArray(book.authors) && book.authors.length > 0) {
      return book.authors.join(', ');
    }
    if (book.author) {
      return book.author;
    }
    return '';
  }, [book]);

  const coverImage =
    book && typeof book.thumbnail === 'string' ? book.thumbnail : null;

  if (!book) {
    return null;
  }

  return (
    <BookInfoCard variant="outlined">
      <Typography variant="overline" color="text.secondary">
        Book details
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
            Cover unavailable
          </Typography>
        )}
      </BookCover>
      <Stack spacing={0.5}>
        <Typography variant="h6" component="h2">
          {book.title}
        </Typography>
        {authorsLabel && (
          <Typography variant="body2" color="text.secondary">
            by {authorsLabel}
          </Typography>
        )}
      </Stack>
      {book.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {book.description}
        </Typography>
      )}
    </BookInfoCard>
  );
}

export default BookDetailsCard;

