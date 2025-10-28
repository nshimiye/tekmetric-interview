import type { Theme } from '@mui/material/styles';

export const createMemoId = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export type StatusKey = 'saved' | 'editing' | 'idle';

export interface StatusVariant {
  message: string;
  color: (theme: Theme) => string;
}

export const STATUS_VARIANTS: Record<StatusKey, StatusVariant> = {
  saved: {
    message: 'memo.memoAdded',
    color: (theme) => theme.palette.success.main,
  },
  editing: {
    message: 'memo.draftInProgress',
    color: (theme) => theme.palette.warning.main,
  },
  idle: {
    message: 'memo.startAMemo',
    color: (theme) => theme.palette.text.secondary,
  },
};

/**
 * Formats a date string to show time if today, or date if not today
 * @param dateString - ISO date string or date-time string
 * @returns Formatted string: "3:17 PM" if today, "Oct 25, 2025" if not today
 */
export const formatMemoDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  
  // Check if the date is today by comparing year, month, and day
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) {
    // Show time only (e.g., "3:17 PM")
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    // Show date only (e.g., "Oct 25, 2025")
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

