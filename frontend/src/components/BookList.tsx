import { NavLink, useMatch } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Book } from '../data/books';

interface BookListItemProps {
  book: Book;
}

function BookListItem({ book }: BookListItemProps) {
  const match = useMatch({
    path: `/books/${book.id}`,
    end: true,
  });

  return (
    <ListItemButton
      to={`/books/${book.id}`}
      component={NavLink}
      selected={Boolean(match)}
      end
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 1,
        borderRadius: 2.5,
        border: (theme) =>
          `1px solid ${
            match
              ? theme.palette.primary.main
              : theme.custom.designTokens.borderCard
          }`,
        backgroundColor: (theme) =>
          match ? theme.palette.action.selected : theme.palette.background.paper,
        transition: (theme) =>
          theme.transitions.create(['background-color', 'transform'], {
            duration: theme.transitions.duration.shortest,
          }),
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <ListItemText
        primary={
          <Typography component="span" fontWeight={600}>
            {book.title}
          </Typography>
        }
        secondary={
          book.author ? (
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
            >
              {book.author}
            </Typography>
          ) : null
        }
        sx={{ m: 0 }}
      />
    </ListItemButton>
  );
}

interface BookListProps {
  books: Book[];
}

function BookList({ books }: BookListProps) {
  return (
    <Box
      component="nav"
      aria-label="Book list"
      data-component="book-list"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <List
        disablePadding
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {books.map((book) => (
          <Box key={book.id} component="li" sx={{ listStyle: 'none' }}>
            <BookListItem book={book} />
          </Box>
        ))}
      </List>
    </Box>
  );
}

export default BookList;

