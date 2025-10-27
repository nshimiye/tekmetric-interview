import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/AuthContext';
import BOOKS from '../../data/books';
import { selectLibrary } from '../../store/slices/librarySlice';
import {
  ensureBookInLibrary,
  addMemo,
  updateMemo,
} from '../../store/thunks/libraryThunks';
import {
  selectPublicMemoStore,
} from '../../store/slices/publicMemosSlice';
import { publishMemo, unpublishMemo } from '../../store/thunks/publicMemosThunks';
import type { AppDispatch } from '../../store';
import type { Memo } from '../../api/library';
import { createMemoId } from './utils/memoUtils';

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
  if (!user) {
    throw new Error('User must be logged in to access BookMemoScreen');
  }
  const currentUserId = user.id;

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
  // Reset form state when book changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      dispatch(ensureBookInLibrary(selectedBook));
    }
  }, [selectedBook, dispatch]);

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

    dispatch(addMemo({ book: selectedBook, memo: memoEntry }));

    if (sharePublic && selectedBookId) {
      dispatch(publishMemo({ bookId: selectedBookId, memo: memoEntry, author: user }));
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

    dispatch(updateMemo({ book: selectedBook, memoId, updatedMemo }));

    if (nextValue) {
      dispatch(publishMemo({ bookId: selectedBookId, memo: updatedMemo, author: user }));
    } else {
      dispatch(unpublishMemo({ bookId: selectedBookId, memoId }));
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
