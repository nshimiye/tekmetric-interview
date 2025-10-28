import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import MemoListSection from './MemoListSection';
import MemoItem from './MemoItem';

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
  
  const emptyState = memos.length === 0 ? (
    <Alert severity="info" variant="outlined">
      {t('memo.saveYourMemosMessage')}
    </Alert>
  ) : undefined;

  return (
    <MemoListSection
      title={t('memo.yourMemos')}
      ariaLabel="Saved memos"
      emptyState={emptyState}
    >
      {memos.map((memo, index) => {
        const isMemoPublic = memo.isPublic === true;

        return (
          <MemoItem
            key={memo.id}
            id={memo.id}
            body={memo.body}
            timestamp={memo.createdAt}
            footer={
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
            }
          />
        );
      })}
    </MemoListSection>
  );
}

export default UserMemosSection;

