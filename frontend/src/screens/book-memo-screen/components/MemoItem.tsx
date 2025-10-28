import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MemoListItem } from './BookMemoScreen.styles';
import { formatMemoDateTime } from '../utils/memoUtils';

interface MemoItemProps {
  id: string;
  body: string;
  timestamp: string;
  footer?: ReactNode;
}

function MemoItem({ id, body, timestamp, footer }: MemoItemProps) {
  return (
    <MemoListItem key={id} component="li" variant="outlined">
      <Stack
        direction={{ xs: 'row' }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="subtitle2" fontWeight={600}>
          {body}
        </Typography>
        <Typography
          component="time"
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0 }}
          dateTime={timestamp}
        >
          {formatMemoDateTime(timestamp)}
        </Typography>
      </Stack>
      {footer && footer}
    </MemoListItem>
  );
}

export default MemoItem;

