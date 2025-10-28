import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/AuthContext';
import { 
  selectSelectedBook,
  selectSelectedBookId,
  selectSavedMemos,
} from '../../store/slices/librarySlice';
import { addMemo, updateMemo } from '../../store/thunks/libraryThunks';
import { publishMemo, unpublishMemo } from '../../store/thunks/publicMemosThunks';
import type { AppDispatch } from '../../store';
import type { Memo } from '../../api/library';
import { createMemoId } from './utils/memoUtils';

export interface UserMemo extends Memo {
  isPublic?: boolean;
}

export function useBookMemoScreen(bookId: string) {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state
  const [draftMemo, setDraftMemo] = useState('');
  const [sharePublic, setSharePublic] = useState(false);
  const [status, setStatus] = useState('idle');
  if (!user) {
    throw new Error('User must be logged in to access BookMemoScreen');
  }
  // Redux state via selectors
  const selectedBook = useSelector(selectSelectedBook(bookId));
  const selectedBookId = useSelector(selectSelectedBookId(bookId));
  const savedMemos: UserMemo[] = useSelector(selectSavedMemos(bookId)) as UserMemo[];

  // Effects
  // Reset form state when book changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftMemo('');
    setStatus('idle');
    setSharePublic(false);
  }, [selectedBook?.id]);

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
    draftMemo,
    status,
    handleMemoChange,
    handleSaveMemo,
    handleClearDraft,
    handleToggleMemoPublic,
  };
}
