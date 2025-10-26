import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ContentContainer from '../../components/layout/ContentContainer';


export const StyledContentContainer = styled(ContentContainer)(({ theme }) => ({
  gap: theme.spacing(6),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(8),
  },
}));


export const MemoLayout = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
  gridTemplateAreas: '"memos" "book"',
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'minmax(0, 2.5fr) minmax(240px, 1fr)',
    gridTemplateAreas: '"memos book"',
    alignItems: 'flex-start',
    gap: theme.spacing(6),
  },
  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'minmax(0, 3fr) minmax(260px, 1fr)',
  },
}));


export const MemoColumn = styled(Stack)(({ theme }) => ({
  gridArea: 'memos',
  gap: theme.spacing(4),
}));

export const BookColumn = styled(Stack)(({ theme }) => ({
  gridArea: 'book',
  gap: theme.spacing(3),
  [theme.breakpoints.up('lg')]: {
    position: 'sticky',
    top: theme.spacing(4),
    alignSelf: 'flex-start',
  },
}));

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

