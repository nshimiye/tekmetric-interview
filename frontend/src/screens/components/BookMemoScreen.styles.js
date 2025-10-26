import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '../../components/Button';
import ContentContainer from '../../components/layout/ContentContainer';
import { STATUS_VARIANTS } from '../utils/memoUtils';

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

export const BookInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3.5),
  },
}));

export const BookCover = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'hasImage',
})(({ theme, hasImage }) => ({
  width: '100%',
  aspectRatio: '3 / 4',
  borderRadius: theme.shape.borderRadius * 3,
  background: hasImage
    ? theme.palette.background.paper
    : theme.custom.gradients.hero(),
  border: `1px solid ${theme.custom.designTokens.borderMuted}`,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const BookCoverImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const MemoCollectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

export const MemoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(4),
  },
}));

export const ResponsiveButton = styled(Button)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

export const MemoList = styled(Stack)(() => ({
  listStyle: 'none',
  padding: 0,
  margin: 0,
}));

export const MemoListItem = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

export const MemoBody = styled(Typography)(() => ({
  whiteSpace: 'pre-line',
  lineHeight: 1.6,
}));

export const StatusText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'statusKey',
})(({ theme, statusKey }) => ({
  fontWeight: 600,
  color:
    (STATUS_VARIANTS[statusKey] ?? STATUS_VARIANTS.idle).color(theme),
}));

