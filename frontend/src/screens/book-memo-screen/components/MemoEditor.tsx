import type { ChangeEvent } from 'react';
import Stack from '@mui/material/Stack';
import { FormTextArea } from '../../../components/Input';
import { MemoCard, StatusText } from './BookMemoScreen.styles';
import type { StatusKey } from '../utils/memoUtils';
import { STATUS_VARIANTS } from '../utils/memoUtils';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

interface MemoEditorProps {
  draftMemo: string;
  onMemoChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onSaveMemo: () => void;
  onClearDraft: () => void;
  status: string;
  memoInputRef: React.Ref<HTMLTextAreaElement>;
}

function MemoEditor({
  draftMemo,
  onMemoChange,
  onSaveMemo,
  onClearDraft,
  status,
}: MemoEditorProps) {
  const { t } = useTranslation();
  const hasDraft = draftMemo.trim().length > 0;
  const statusKey: StatusKey = (status in STATUS_VARIANTS ? status : 'idle') as StatusKey;
  const statusMessage =
    (STATUS_VARIANTS[statusKey] ?? STATUS_VARIANTS.idle).message;

  return (
    <MemoCard elevation={0}>
      <FormTextArea
        aria-label="Your notes"
        name="memo"
        placeholder="What resonated with you? Capture quotes, themes, or questions."
        value={draftMemo}
        onChange={onMemoChange}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Button onClick={onSaveMemo} disabled={!hasDraft}>
          {t('book.addMemo')}
        </Button>
        <Button
          variant="outlined"
          onClick={onClearDraft}
          disabled={!hasDraft}
        >
          {t('memo.clearDraft')}
        </Button>
        <StatusText variant="caption" statusKey={statusKey}>
          {t(statusMessage)}
        </StatusText>
      </Stack>
    </MemoCard>
  );
}

export default MemoEditor;

