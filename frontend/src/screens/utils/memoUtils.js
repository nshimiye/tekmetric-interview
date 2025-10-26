export const createMemoId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const STATUS_VARIANTS = {
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

