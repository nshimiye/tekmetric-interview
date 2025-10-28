import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getPublicMemosForBook,
  type MemoAuthor,
  type PublicMemo,
  type PaginationInfo
} from '../../api/publicMemos';
import {
  publicMemosInternalActions,
  type MemoInput,
} from '../slices/publicMemosSlice';
import type { RootState } from '../index';

/**
 * Async thunk that loads more memos for a specific book with pagination
 */
export const loadMorePublicMemos = createAsyncThunk<
  { bookId: string; memos: PublicMemo[]; pagination: PaginationInfo },
  { bookId: string; page: number; limit?: number },
  { rejectValue: string; state: RootState }
>('publicMemos/loadMore', async ({ bookId, page, limit = 10 }, { rejectWithValue }) => {
  try {
    const response = await getPublicMemosForBook(bookId, page, limit);
    return {
      bookId,
      memos: response.memos,
      pagination: response.pagination
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load more memos';
    return rejectWithValue(message);
  }
});

export const publishMemo = createAsyncThunk<
  void,
  { bookId: string; memo: MemoInput; author: MemoAuthor },
  { state: RootState }
>('publicMemos/publishMemoAndPersist', async (payload, { dispatch }) => {
  dispatch(publicMemosInternalActions.publishMemo(payload));
});

export const unpublishMemo = createAsyncThunk<
  void,
  { bookId: string; memoId: string },
  { state: RootState }
>('publicMemos/unpublishMemoAndPersist', async (payload, { dispatch }) => {
  dispatch(publicMemosInternalActions.unpublishMemo(payload));
});
