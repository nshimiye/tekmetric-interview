import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MemoCollectionCard, MemoList } from './BookMemoScreen.styles';

interface MemoListSectionProps {
  title: string;
  ariaLabel: string;
  children: ReactNode;
  emptyState?: ReactNode;
}

function MemoListSection({
  title,
  ariaLabel,
  children,
  emptyState,
}: MemoListSectionProps) {
  return (
    <MemoCollectionCard variant="outlined">
      <Stack spacing={1}>
        <Typography variant="h5" component="h3">
          {title}
        </Typography>
      </Stack>
      {emptyState ? (
        emptyState
      ) : (
        <MemoList component="ul" spacing={2.5} aria-label={ariaLabel}>
          {children}
        </MemoList>
      )}
    </MemoCollectionCard>
  );
}

export default MemoListSection;

