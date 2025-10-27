import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { StatusKey } from '../utils/memoUtils';
import { STATUS_VARIANTS } from '../utils/memoUtils';


export const BookInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3.5),
  },
}));

interface BookCoverProps {
  hasImage?: boolean;
}

export const BookCover = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'hasImage',
})<BookCoverProps>(({ theme, hasImage }) => ({
  width: '100%',
  aspectRatio: '3 / 4',
  // borderRadius: theme.shape.borderRadius * 3,
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

export const MemoList = styled(Stack)(() => ({
  listStyle: 'none',
  padding: 0,
  margin: 0,
})) as typeof Stack;

export const MemoListItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
})) as typeof Paper;

export const MemoBody = styled(Typography)(() => ({
  whiteSpace: 'pre-line',
  lineHeight: 1.6,
}));

interface StatusTextProps {
  statusKey?: StatusKey;
}

export const StatusText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'statusKey',
})<StatusTextProps>(({ theme, statusKey = 'idle' }) => ({
  fontWeight: 600,
  color:
    (STATUS_VARIANTS[statusKey] ?? STATUS_VARIANTS.idle).color(theme),
}));

