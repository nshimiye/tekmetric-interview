import { Theme } from '@mui/material/styles';

export const createMemoId = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export type StatusKey = 'saved' | 'editing' | 'idle';

export interface StatusVariant {
  message: string;
  color: (theme: Theme) => string;
}

export const STATUS_VARIANTS: Record<StatusKey, StatusVariant> = {
  saved: {
    message: 'Memo added',
    color: (theme) => theme.palette.success.main,
  },
  editing: {
    message: 'Draft in progress',
    color: (theme) => theme.palette.warning.main,
  },
  idle: {
    message: 'Start a memo',
    color: (theme) => theme.palette.text.secondary,
  },
};

