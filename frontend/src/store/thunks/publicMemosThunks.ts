import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  loadPublicMemoStore, 
  savePublicMemoStore, 
  getPublicMemosForBook,
  type MemoAuthor,
  type PublicMemo,
  type PaginationInfo
} from '../../api/publicMemos';
import {
  publicMemosInternalActions,
  type MemoInput,
  type PublicMemoStore,
} from '../slices/publicMemosSlice';
import type { RootState } from '../index';

/**
 * Async thunk that loads the shared memo store.
 * Centralizing thunks here keeps API-bound actions easy to discover.
 */
export const loadPublicMemos = createAsyncThunk<
  PublicMemoStore,
  void,
  { rejectValue: string }
>('publicMemos/load', async (_, { rejectWithValue }) => {
  try {
    return await loadPublicMemoStore();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load public memos';
    return rejectWithValue(message);
  }
});

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

const persistPublicMemoStore = async (getState: () => RootState): Promise<void> => {
  const { store } = getState().publicMemos;

  try {
    await savePublicMemoStore(store);
  } catch (error) {
    console.error('Failed to persist public memo store', error);
  }
};

export const publishMemo = createAsyncThunk<
  void,
  { bookId: string; memo: MemoInput; author: MemoAuthor },
  { state: RootState }
>('publicMemos/publishMemoAndPersist', async (payload, { dispatch, getState }) => {
  dispatch(publicMemosInternalActions.publishMemo(payload));
  await persistPublicMemoStore(getState);
});

export const unpublishMemo = createAsyncThunk<
  void,
  { bookId: string; memoId: string },
  { state: RootState }
>('publicMemos/unpublishMemoAndPersist', async (payload, { dispatch, getState }) => {
  dispatch(publicMemosInternalActions.unpublishMemo(payload));
  await persistPublicMemoStore(getState);
});

export default loadPublicMemos;
