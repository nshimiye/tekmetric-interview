import { NavLink, useMatch } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { Book } from '../data/books';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  borderRadius: theme.spacing(2.5),
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
  },
  '&.Mui-selected': {
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.action.selected,
  },
  '&:not(.Mui-selected)': {
    border: `1px solid ${theme.custom.designTokens.borderCard}`,
    backgroundColor: theme.palette.background.paper,
  },
})) as typeof ListItemButton;

const StyledListItemText = styled(ListItemText)(() => ({
  margin: 0,
}));

const BookListContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
})) as typeof Box;

const StyledList = styled(List)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const ListItem = styled(Box)(() => ({
  listStyle: 'none',
})) as typeof Box;

interface BookListItemProps {
  book: Book;
}

function BookListItem({ book }: BookListItemProps) {
  const match = useMatch({
    path: `/books/${book.id}`,
    end: true,
  });

  return (
    <StyledListItemButton
      to={`/books/${book.id}`}
      component={NavLink}
      selected={Boolean(match)}
      end
    >
      <StyledListItemText
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
      />
    </StyledListItemButton>
  );
}

interface BookListProps {
  books: Book[];
}

function BookList({ books }: BookListProps) {
  return (
    <BookListContainer
      component="nav"
      aria-label="Book list"
      data-component="book-list"
    >
      <StyledList disablePadding>
        {books.map((book) => (
          <ListItem key={book.id} component="li">
            <BookListItem book={book} />
          </ListItem>
        ))}
      </StyledList>
    </BookListContainer>
  );
}

export default BookList;

