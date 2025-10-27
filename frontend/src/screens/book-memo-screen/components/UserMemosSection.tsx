import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {
  MemoCollectionCard,
  MemoList,
  MemoListItem,
} from './BookMemoScreen.styles';
import { useTranslation } from 'react-i18next';

interface UserMemo {
  id: string;
  body: string;
  createdAt: string;
  isPublic?: boolean;
}

interface UserMemosSectionProps {
  memos: UserMemo[];
  onToggleMemoPublic: (memoId: string, isPublic: boolean) => void;
}

function UserMemosSection({ memos, onToggleMemoPublic }: UserMemosSectionProps) {
  const { t } = useTranslation();
  return (
    <MemoCollectionCard variant="outlined">
      <Stack spacing={1}>
        <Typography variant="h5" component="h3">
          {t('memo.yourMemos')}
        </Typography>
      </Stack>

      {memos.length > 0 ? (
        <MemoList component="ul" spacing={2.5} aria-label="Saved memos">
          {memos.map((memo, index) => {
            const isMemoPublic = memo.isPublic === true;

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
                  <Typography
                    component="time"
                    variant="caption"
                    color="text.secondary"
                    dateTime={memo.createdAt}
                  >
                    {new Date(memo.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {isMemoPublic
                      ? 'Shared with other readers'
                      : 'Private memo'}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        color="primary"
                        checked={isMemoPublic}
                        onChange={(event) =>
                          onToggleMemoPublic(memo.id, event.target.checked)
                        }
                        inputProps={{
                          'aria-label': `Share memo ${
                            index + 1
                          } with other readers`,
                        }}
                      />
                    }
                    label="Share with other readers"
                    componentsProps={{
                      typography: { variant: 'body2' },
                    }}
                  />
                </Stack>
              </MemoListItem>
            );
          })}
        </MemoList>
      ) : (
        <Alert severity="info" variant="outlined">
          {t('memo.saveYourMemosMessage')}
        </Alert>
      )}
    </MemoCollectionCard>
  );
}

export default UserMemosSection;

