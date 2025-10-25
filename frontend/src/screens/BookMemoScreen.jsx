import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Navigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button from '../components/Button';
import Input from '../components/Input';
import ContentContainer from '../components/layout/ContentContainer';
import { useAuth } from '../auth/AuthContext';
import BOOKS from '../data/books';

const createMemoId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const STATUS_VARIANTS = {
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

const StyledContentContainer = styled(ContentContainer)(({ theme }) => ({
  gap: theme.spacing(6),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(8),
  },
}));

const MemoLayout = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
  gridTemplateAreas: '"memos" "book"',
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'minmax(0, 2.5fr) minmax(240px, 1fr)',
    gridTemplateAreas: '"memos book"',
    alignItems: 'flex-start',
    gap: theme.spacing(6),
  },
  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'minmax(0, 3fr) minmax(260px, 1fr)',
  },
}));

const MemoColumn = styled(Stack)(({ theme }) => ({
  gridArea: 'memos',
  gap: theme.spacing(4),
}));

const BookColumn = styled(Stack)(({ theme }) => ({
  gridArea: 'book',
  gap: theme.spacing(3),
  [theme.breakpoints.up('lg')]: {
    position: 'sticky',
    top: theme.spacing(4),
    alignSelf: 'flex-start',
  },
}));

const BookInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3.5),
  },
}));

const BookCover = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'hasImage',
})(({ theme, hasImage }) => ({
  width: '100%',
  aspectRatio: '3 / 4',
  borderRadius: theme.shape.borderRadius * 3,
  background: hasImage
    ? theme.palette.background.paper
    : theme.custom.gradients.hero(),
  border: `1px solid ${theme.custom.designTokens.borderMuted}`,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const BookCoverImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const MemoCollectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const MemoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(4),
  },
}));

const ResponsiveButton = styled(Button)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
}));

const MemoList = styled(Stack)(() => ({
  listStyle: 'none',
  padding: 0,
  margin: 0,
}));

const MemoListItem = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

const MemoBody = styled(Typography)(() => ({
  whiteSpace: 'pre-line',
  lineHeight: 1.6,
}));

const StatusText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'statusKey',
})(({ theme, statusKey }) => ({
  fontWeight: 600,
  color:
    (STATUS_VARIANTS[statusKey] ?? STATUS_VARIANTS.idle).color(theme),
}));

function BookMemoScreen() {
  const { user } = useAuth();
  const outletContext = useOutletContext() ?? {};
  const library = outletContext.library ?? {};
  const ensureBookInLibrary = outletContext.ensureBookInLibrary ?? (() => null);
  const updateBookMemos = outletContext.updateBookMemos ?? (() => {});
  const publicMemoStore = outletContext.publicMemos ?? {};
  const publishPublicMemo =
    outletContext.publishPublicMemo ?? (() => {});
  const unpublishPublicMemo =
    outletContext.unpublishPublicMemo ?? (() => {});
  const { bookId } = useParams();
  const [draftMemo, setDraftMemo] = useState('');
  const [sharePublic, setSharePublic] = useState(false);
  const [status, setStatus] = useState('idle');
  const memoInputRef = useRef(null);
  const currentUserId = user?.id ?? null;

  const libraryEntry = library?.[bookId] ?? null;
  const catalogBook = useMemo(
    () => BOOKS.find((book) => book.id === bookId) ?? null,
    [bookId],
  );
  const selectedBook = libraryEntry?.book ?? catalogBook ?? null;
  const selectedBookId = selectedBook?.id ?? bookId ?? null;
  const savedMemos = Array.isArray(libraryEntry?.memos)
    ? libraryEntry.memos
    : [];
  const sharedMemos = useMemo(() => {
    if (!selectedBookId) {
      return [];
    }

    const entries = Array.isArray(publicMemoStore[selectedBookId])
      ? publicMemoStore[selectedBookId]
      : [];

    return entries.filter(
      (entry) => (entry?.author?.id ?? null) !== currentUserId,
    );
  }, [publicMemoStore, selectedBookId, currentUserId]);
  const canViewSharedMemos =
    savedMemos.length > 0 && sharedMemos.length > 0;
  const hasDraft = draftMemo.trim().length > 0;
  const authorsLabel = useMemo(() => {
    if (!selectedBook) {
      return '';
    }
    if (Array.isArray(selectedBook.authors) && selectedBook.authors.length > 0) {
      return selectedBook.authors.join(', ');
    }
    if (selectedBook.author) {
      return selectedBook.author;
    }
    return '';
  }, [selectedBook]);
  const coverImage =
    selectedBook && typeof selectedBook.thumbnail === 'string'
      ? selectedBook.thumbnail
      : null;

  useEffect(() => {
    setDraftMemo('');
    setStatus('idle');
    setSharePublic(false);
  }, [selectedBook?.id]);

  useEffect(() => {
    if (status === 'idle' || status === 'saved') {
      memoInputRef.current?.focus();
    }
  }, [status]);

  useEffect(() => {
    if (selectedBook) {
      ensureBookInLibrary(selectedBook);
    }
  }, [ensureBookInLibrary, selectedBook]);

  if (!selectedBook) {
    return <Navigate to="/" replace />;
  }

  const handleMemoChange = (event) => {
    setDraftMemo(event.target.value);
    setStatus('editing');
  };

  const handleShareDraftChange = (event) => {
    setSharePublic(event.target.checked);
  };

  const handleSaveMemo = () => {
    if (!hasDraft) {
      return;
    }

    const memoEntry = {
      id: createMemoId(),
      body: draftMemo.trim(),
      createdAt: new Date().toISOString(),
      isPublic: sharePublic,
    };

    updateBookMemos(selectedBook, (existing) => {
      const current = Array.isArray(existing) ? existing : [];
      return [...current, memoEntry];
    });

    if (sharePublic && selectedBookId) {
      publishPublicMemo(selectedBookId, memoEntry, user);
    }

    setDraftMemo('');
    setStatus('saved');
  };

  const handleClearDraft = () => {
    setDraftMemo('');
    setStatus('idle');
  };

  const handleToggleMemoPublic = (memoId, nextValue) => {
    if (!selectedBookId) {
      return;
    }

    const target = savedMemos.find((memo) => memo.id === memoId);
    if (!target || target.isPublic === nextValue) {
      return;
    }

    const updatedMemo = {
      ...target,
      isPublic: nextValue,
    };

    updateBookMemos(selectedBook, (existing) => {
      if (!Array.isArray(existing)) {
        return [];
      }

      return existing.map((memo) =>
        memo.id === memoId ? updatedMemo : memo,
      );
    });

    if (nextValue) {
      publishPublicMemo(selectedBookId, updatedMemo, user);
    } else {
      unpublishPublicMemo(selectedBookId, memoId);
    }
  };

  const statusKey = STATUS_VARIANTS[status] ? status : 'idle';
  const statusMessage = (STATUS_VARIANTS[statusKey] ?? STATUS_VARIANTS.idle).message;

  return (
    <StyledContentContainer>
      <MemoLayout>
        <MemoColumn>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              {selectedBook.title}
            </Typography>
            <Typography variant="h4">Your memos</Typography>
            <Typography variant="body2" color="text.secondary">
              Capture notes that matter to you now and come back to them later.
            </Typography>
          </Stack>

          <MemoCard elevation={0}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">
                New memo
              </Typography>
              <Typography variant="h5" component="h2">
                Write what stood out
              </Typography>
            </Stack>

            <Input
              multiline
              label="Your notes"
              name="memo"
              placeholder="What resonated with you? Capture quotes, themes, or questions."
              value={draftMemo}
              onChange={handleMemoChange}
              inputRef={memoInputRef}
            />

            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={sharePublic}
                  onChange={handleShareDraftChange}
                  inputProps={{
                    'aria-label': 'Share this memo with other readers',
                  }}
                />
              }
              label="Share this memo with other readers"
              componentsProps={{
                typography: { variant: 'body2' },
              }}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'flex-start' } }}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <ResponsiveButton
                onClick={handleSaveMemo}
                disabled={!hasDraft}
              >
                Add memo
              </ResponsiveButton>
              <ResponsiveButton
                variant="secondary"
                onClick={handleClearDraft}
                disabled={!hasDraft}
              >
                Clear draft
              </ResponsiveButton>
              <StatusText variant="caption" statusKey={statusKey}>
                {statusMessage}
              </StatusText>
            </Stack>
          </MemoCard>

          <MemoCollectionCard variant="outlined">
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">
                Saved memos
              </Typography>
              <Typography variant="h5" component="h3">
                Your running log
              </Typography>
            </Stack>

            {savedMemos.length > 0 ? (
              <MemoList
                component="ul"
                spacing={2.5}
                aria-label="Saved memos"
              >
                {savedMemos.map((memo, index) => {
                  const isMemoPublic = memo.isPublic === true;

                  return (
                    <MemoListItem
                      key={memo.id}
                      component="li"
                      variant="outlined"
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'baseline' }}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          Memo {index + 1}
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
                      <MemoBody
                        variant="body2"
                        color="text.secondary"
                      >
                        {memo.body}
                      </MemoBody>
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
                                handleToggleMemoPublic(
                                  memo.id,
                                  event.target.checked,
                                )
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
                Save your memos to build a running log of what caught your
                attention in this book.
              </Alert>
            )}
          </MemoCollectionCard>

          {canViewSharedMemos && (
            <MemoCollectionCard variant="outlined">
              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  Community
                </Typography>
                <Typography variant="h5" component="h3">
                  Shared memos from other readers
                </Typography>
              </Stack>
              <MemoList
                component="ul"
                spacing={2.5}
                aria-label="Shared memos from other readers"
              >
                {sharedMemos.map((memo) => {
                  const sharedTimestamp = memo.sharedAt ?? memo.createdAt;
                  const sharedDateObj = sharedTimestamp
                    ? new Date(sharedTimestamp)
                    : null;
                  const sharedDate =
                    sharedDateObj && !Number.isNaN(sharedDateObj.getTime())
                      ? sharedDateObj.toLocaleString()
                      : null;
                  const displayName =
                    memo.author?.name ?? 'Anonymous reader';

                  return (
                    <MemoListItem
                      key={memo.id}
                      component="li"
                      variant="outlined"
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'baseline' }}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          {displayName}
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
                      <MemoBody
                        variant="body2"
                        color="text.secondary"
                      >
                        {memo.body}
                      </MemoBody>
                    </MemoListItem>
                  );
                })}
              </MemoList>
            </MemoCollectionCard>
          )}
        </MemoColumn>

        <BookColumn>
          <BookInfoCard variant="outlined">
            <Typography variant="overline" color="text.secondary">
              Book details
            </Typography>
            <BookCover
              aria-hidden={!coverImage}
              hasImage={Boolean(coverImage)}
            >
              {coverImage ? (
                <BookCoverImage
                  src={coverImage}
                  alt={`Cover of ${selectedBook.title}`}
                  loading="lazy"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Cover unavailable
                </Typography>
              )}
            </BookCover>
            <Stack spacing={0.5}>
              <Typography variant="h6" component="h2">
                {selectedBook.title}
              </Typography>
              {authorsLabel && (
                <Typography variant="body2" color="text.secondary">
                  by {authorsLabel}
                </Typography>
              )}
            </Stack>
            {selectedBook.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {selectedBook.description}
              </Typography>
            )}
          </BookInfoCard>
        </BookColumn>
      </MemoLayout>
    </StyledContentContainer>
  );
}

export default BookMemoScreen;
