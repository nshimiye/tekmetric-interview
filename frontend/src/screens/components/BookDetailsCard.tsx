import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  BookInfoCard,
  BookCover,
  BookCoverImage,
} from './BookMemoScreen.styles';
import { Book } from '../../data/books';
import { LibraryBook } from '../../store/slices/librarySlice';

interface BookDetailsCardProps {
  book: Book | LibraryBook | null;
}

function BookDetailsCard({ book }: BookDetailsCardProps) {
  const authorsLabel = useMemo(() => {
    if (!book) {
      return '';
    }
    const libraryBook = book as LibraryBook;
    if (Array.isArray(libraryBook.authors) && libraryBook.authors.length > 0) {
      return libraryBook.authors.join(', ');
    }
    const catalogBook = book as Book;
    if (catalogBook.author) {
      return catalogBook.author;
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

