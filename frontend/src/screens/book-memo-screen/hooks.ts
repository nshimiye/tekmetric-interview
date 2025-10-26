import { useCallback, useEffect, useMemo, useRef, useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/AuthContext';
import BOOKS, { Book } from '../../data/books';
import {
  selectLibrary,
  ensureBookInLibrary as ensureBookInLibraryAction,
  addMemo as addMemoAction,
  updateMemo as updateMemoAction,
  LibraryBook,
} from '../../store/slices/librarySlice';
import {
  selectPublicMemoStore,
  publishMemo,
  unpublishMemo,
} from '../../store/slices/publicMemosSlice';
import { AppDispatch } from '../../store';
import { Memo } from '../../library/libraryStorage';
import { createMemoId } from '../utils/memoUtils';

export interface UserMemo extends Memo {
  isPublic?: boolean;
}

export function useBookMemoScreen(bookId: string | undefined) {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const library = useSelector(selectLibrary);
  const publicMemoStore = useSelector(selectPublicMemoStore);

  // Local state
  const [draftMemo, setDraftMemo] = useState('');
  const [sharePublic, setSharePublic] = useState(false);
  const [status, setStatus] = useState('idle');
  const memoInputRef = useRef<HTMLTextAreaElement>(null);
  const currentUserId = user?.id ?? null;

  // Redux action dispatchers
  const ensureBookInLibrary = useCallback(
    (book: Book | LibraryBook) => {
      dispatch(ensureBookInLibraryAction(book));
    },
    [dispatch],
  );

  const addMemoToBook = useCallback(
    (book: Book | LibraryBook, memo: Memo) => {
      dispatch(addMemoAction({ book, memo }));
    },
    [dispatch],
  );

  const updateBookMemo = useCallback(
    (book: Book | LibraryBook, memoId: string, updatedMemo: Memo) => {
      dispatch(updateMemoAction({ book, memoId, updatedMemo }));
    },
    [dispatch],
  );

  const publishPublicMemo = useCallback(
    (bookIdParam: string, memo: UserMemo, author: typeof user) => {
      dispatch(publishMemo({ bookId: bookIdParam, memo, author }));
    },
    [dispatch],
  );

  const unpublishPublicMemo = useCallback(
    (bookIdParam: string, memoId: string) => {
      dispatch(unpublishMemo({ bookId: bookIdParam, memoId }));
    },
    [dispatch],
  );

  // Derived state
  const libraryEntry = bookId ? library?.[bookId] ?? null : null;
  const catalogBook = useMemo(
    () => BOOKS.find((book) => book.id === bookId) ?? null,
    [bookId],
  );
  const selectedBook = libraryEntry?.book ?? catalogBook ?? null;
  const selectedBookId = selectedBook?.id ?? bookId ?? null;
  const savedMemos: UserMemo[] = Array.isArray(libraryEntry?.memos)
    ? (libraryEntry.memos as UserMemo[])
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

  const canViewSharedMemos = savedMemos.length > 0 && sharedMemos.length > 0;

  // Effects
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

  // Event handlers
  const handleMemoChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraftMemo(event.target.value);
    setStatus('editing');
  };

  const handleSaveMemo = () => {
    const hasDraft = draftMemo.trim().length > 0;
    if (!hasDraft || !selectedBook) {
      return;
    }

    const memoEntry: UserMemo = {
      id: createMemoId(),
      body: draftMemo.trim(),
      createdAt: new Date().toISOString(),
      isPublic: sharePublic,
    };

    addMemoToBook(selectedBook, memoEntry);

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

  const handleToggleMemoPublic = (memoId: string, nextValue: boolean) => {
    if (!selectedBookId || !selectedBook) {
      return;
    }

    const target = savedMemos.find((memo) => memo.id === memoId);
    if (!target || target.isPublic === nextValue) {
      return;
    }

    const updatedMemo: UserMemo = {
      ...target,
      isPublic: nextValue,
    };

    updateBookMemo(selectedBook, memoId, updatedMemo);

    if (nextValue) {
      publishPublicMemo(selectedBookId, updatedMemo, user);
    } else {
      unpublishPublicMemo(selectedBookId, memoId);
    }
  };

  return {
    selectedBook,
    savedMemos,
    sharedMemos,
    canViewSharedMemos,
    draftMemo,
    status,
    memoInputRef,
    handleMemoChange,
    handleSaveMemo,
    handleClearDraft,
    handleToggleMemoPublic,
  };
}

