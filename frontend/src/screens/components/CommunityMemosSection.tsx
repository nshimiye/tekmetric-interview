import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  MemoCollectionCard,
  MemoList,
  MemoListItem,
  MemoBody,
} from './BookMemoScreen.styles';
import { PublicMemo } from '../../library/publicMemoStorage';

interface CommunityMemosSectionProps {
  memos: PublicMemo[];
}

function CommunityMemosSection({ memos }: CommunityMemosSectionProps) {
  if (!memos || memos.length === 0) {
    return null;
  }

  return (
    <MemoCollectionCard variant="outlined">
      <Stack spacing={1}>
        <Typography variant="h5" component="h3">
          Community
        </Typography>
      </Stack>
      <MemoList
        component="ul"
        spacing={2.5}
        aria-label="Shared memos from other readers"
      >
        {memos.map((memo) => {
          const sharedTimestamp = memo.sharedAt ?? memo.createdAt;
          const sharedDateObj = sharedTimestamp
            ? new Date(sharedTimestamp)
            : null;
          const sharedDate =
            sharedDateObj && !Number.isNaN(sharedDateObj.getTime())
              ? sharedDateObj.toLocaleString()
              : null;
          const displayName = memo.author?.name ?? 'Anonymous reader';

          return (
            <MemoListItem key={memo.id} component="li" variant="outlined">
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'baseline' }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {memo.body}
                </Typography>
                {sharedDate ? (
                  <Typography
                    component="time"
                    variant="caption"
                    color="text.secondary"
                    dateTime={sharedTimestamp}
                  >
                    {sharedDate}
                  </Typography>
                ) : null}
              </Stack>
              <MemoBody variant="body2" color="text.secondary">
                By {displayName}
              </MemoBody>
            </MemoListItem>
          );
        })}
      </MemoList>
    </MemoCollectionCard>
  );
}

export default CommunityMemosSection;

