import Stack from '@mui/material/Stack';
import Input from '../../components/Input';
import { MemoCard, ResponsiveButton, StatusText } from './BookMemoScreen.styles';
import { STATUS_VARIANTS } from '../utils/memoUtils';

function MemoEditor({
  draftMemo,
  onMemoChange,
  onSaveMemo,
  onClearDraft,
  status,
  memoInputRef,
}) {
  const hasDraft = draftMemo.trim().length > 0;
  const statusKey = STATUS_VARIANTS[status] ? status : 'idle';
  const statusMessage =
    (STATUS_VARIANTS[statusKey] ?? STATUS_VARIANTS.idle).message;

  return (
    <MemoCard elevation={0}>
      <Input
        multiline
        ariaLabel="Your notes"
        name="memo"
        placeholder="What resonated with you? Capture quotes, themes, or questions."
        value={draftMemo}
        onChange={onMemoChange}
        inputRef={memoInputRef}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <ResponsiveButton onClick={onSaveMemo} disabled={!hasDraft}>
          Add memo
        </ResponsiveButton>
        <ResponsiveButton
          variant="secondary"
          onClick={onClearDraft}
          disabled={!hasDraft}
        >
          Clear draft
        </ResponsiveButton>
        <StatusText variant="caption" statusKey={statusKey}>
          {statusMessage}
        </StatusText>
      </Stack>
    </MemoCard>
  );
}

export default MemoEditor;

