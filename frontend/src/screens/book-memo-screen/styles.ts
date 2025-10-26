import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

// Re-export common styles used by BookMemoScreen and its children
export {
  StyledContentContainer,
  MemoLayout,
  MemoColumn,
  BookColumn,
} from '../components/BookMemoScreen.styles';

// BookMemoScreen-specific styles
export const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const BreadcrumbLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.text.primary,
  },
}));

