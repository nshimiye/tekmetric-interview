import { createAsyncThunk } from '@reduxjs/toolkit';
import { loadUserLibrary, saveUserLibrary } from '../../api/library';
import { libraryInternalActions, type BookInput, type LibraryItems } from '../slices/librarySlice';
import type { RootState } from '../index';
import type { Memo } from '../../api/library';

/**
 * Async thunk for fetching a user's library from the API layer.
 * Keeping thunks in the dedicated folder helps identify actions that trigger network calls.
 */
export const loadLibrary = createAsyncThunk<
  { userId: string | null; library: LibraryItems },
  { userId: string | null },
  { rejectValue: string }
>('library/load', async ({ userId }, { rejectWithValue }) => {
  if (!userId) {
    return { userId: null, library: {} };
  }

  try {
    const library = await loadUserLibrary(userId);
    return { userId, library };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load user library';
    return rejectWithValue(message);
  }
});

const persistLibraryState = async (getState: () => RootState): Promise<void> => {
  const { userId, items } = getState().library;
  if (!userId) {
    return;
  }

  try {
    await saveUserLibrary(userId, items);
  } catch (error) {
    console.error('Failed to persist user library', error);
  }
};

export const ensureBookInLibrary = createAsyncThunk<void, BookInput, { state: RootState }>(
  'library/ensureBookInLibraryAndPersist',
  async (book, { dispatch, getState }) => {
    dispatch(libraryInternalActions.ensureBookInLibrary(book));
    await persistLibraryState(getState);
  },
);

export const addMemo = createAsyncThunk<
  void,
  { book: BookInput; memo: Memo },
  { state: RootState }
>('library/addMemoAndPersist', async (payload, { dispatch, getState }) => {
  dispatch(libraryInternalActions.addMemo(payload));
  await persistLibraryState(getState);
});

export const updateMemo = createAsyncThunk<
  void,
  { book: BookInput; memoId: string; updatedMemo: Memo },
  { state: RootState }
>('library/updateMemoAndPersist', async (payload, { dispatch, getState }) => {
  dispatch(libraryInternalActions.updateMemo(payload));
  await persistLibraryState(getState);
});

export default loadLibrary;
