import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useAuth } from '../auth/AuthContext';
import BOOKS from '../data/books';

// Redux imports
import {
  selectLibrary,
  ensureBookInLibrary as ensureBookInLibraryAction,
  updateBookMemos as updateBookMemosAction,
} from '../store/slices/librarySlice';

import {
  selectPublicMemoStore,
  publishMemo,
  unpublishMemo,
} from '../store/slices/publicMemosSlice';

// Component imports
import MemoEditor from './components/MemoEditor';
import UserMemosSection from './components/UserMemosSection';
import CommunityMemosSection from './components/CommunityMemosSection';
import BookDetailsCard from './components/BookDetailsCard';

// Styles and utilities
import {
  StyledContentContainer,
  MemoLayout,
  MemoColumn,
  BookColumn,
} from './components/BookMemoScreen.styles';
import { createMemoId } from './utils/memoUtils';

function BookMemoScreen() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookId } = useParams();

  // Redux state
  const library = useSelector(selectLibrary);
  const publicMemoStore = useSelector(selectPublicMemoStore);

  const [draftMemo, setDraftMemo] = useState('');
  const [sharePublic, setSharePublic] = useState(false);
  const [status, setStatus] = useState('idle');
  const memoInputRef = useRef(null);
  const currentUserId = user?.id ?? null;

  // Redux action dispatchers
  const ensureBookInLibrary = useCallback(
    (book) => {
      dispatch(ensureBookInLibraryAction(book));
    },
    [dispatch],
  );

  const updateBookMemos = useCallback(
    (book, memoUpdater) => {
      dispatch(updateBookMemosAction({ book, memoUpdater }));
    },
    [dispatch],
  );

  const publishPublicMemo = useCallback(
    (bookId, memo, author) => {
      dispatch(publishMemo({ bookId, memo, author }));
    },
    [dispatch],
  );

  const unpublishPublicMemo = useCallback(
    (bookId, memoId) => {
      dispatch(unpublishMemo({ bookId, memoId }));
    },
    [dispatch],
  );

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

  const handleSaveMemo = () => {
    const hasDraft = draftMemo.trim().length > 0;
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

  return (
    <StyledContentContainer>
      <MemoLayout>
        <MemoColumn>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate('/')}
              sx={{
                textDecoration: 'none',
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                  color: 'text.primary',
                },
              }}
            >
              Home
            </Link>
            <Typography variant="body1" color="text.primary">
              {selectedBook.title}
            </Typography>
          </Breadcrumbs>

          <MemoEditor
            draftMemo={draftMemo}
            onMemoChange={handleMemoChange}
            onSaveMemo={handleSaveMemo}
            onClearDraft={handleClearDraft}
            status={status}
            memoInputRef={memoInputRef}
          />

          <UserMemosSection
            memos={savedMemos}
            onToggleMemoPublic={handleToggleMemoPublic}
          />

          {canViewSharedMemos && (
            <CommunityMemosSection memos={sharedMemos} />
          )}
        </MemoColumn>

        <BookColumn>
          <BookDetailsCard book={selectedBook} />
        </BookColumn>
      </MemoLayout>
    </StyledContentContainer>
  );
}

export default BookMemoScreen;
