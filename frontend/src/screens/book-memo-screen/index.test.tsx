import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi } from 'vitest';
import BookMemoScreen from './index';
import type { PublicUser} from '../../auth/AuthContext';
import { useAuth } from '../../auth/AuthContext';
import libraryReducer, { loadLibrary } from '../../store/slices/librarySlice';
import publicMemosReducer from '../../store/slices/publicMemosSlice';
import searchReducer from '../../store/slices/searchSlice';
import theme from '../../styles/theme';

// Mock the auth hook
vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn(),
  PublicUser: undefined,
}));

// Mock the library storage functions
vi.mock('../../library/libraryStorage', () => ({
  loadUserLibrary: vi.fn(() => ({})),
  saveUserLibrary: vi.fn(),
  Memo: undefined,
  UserLibrary: undefined,
}));

const mockedUseAuth = vi.mocked(useAuth);

// Mock user for testing
const mockUser: PublicUser = {
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com',
};

// Helper function to create a test store
function createTestStore() {
  const store = configureStore({
    reducer: {
      library: libraryReducer,
      search: searchReducer,
      publicMemos: publicMemosReducer,
    },
  });
  
  // Initialize the library with the test user's ID
  store.dispatch(loadLibrary({ userId: mockUser.id }));
  
  return store;
}

// Helper function to render the component with all necessary providers
function renderWithProviders(bookId: string) {
  const store = createTestStore();

  // Mock the useAuth hook to return our mock user
  mockedUseAuth.mockReturnValue({
    user: mockUser,
    isAuthenticated: true,
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  });

  const { container } = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter 
          initialEntries={[`/book/${bookId}`]}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/book/:bookId" element={<BookMemoScreen />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );

  return { store, container };
}

describe('BookMemoScreen', () => {
  it('should add a memo and display it in the Your memos section', async () => {
    const user = userEvent.setup();
    
    // Render the component with a valid book ID
    renderWithProviders('the-martian');

    // Verify "Your memos" section exists with the empty state message
    expect(screen.getByRole('heading', { name: /Your memos/i })).toBeInTheDocument();
    expect(screen.getByText(/Save your memos to build a running log/i)).toBeInTheDocument();

    // Find the memo input field
    const memoInput = screen.getByPlaceholderText(
      /What resonated with you/i
    );
    expect(memoInput).toBeInTheDocument();

    // Type a memo into the input
    const testMemo = 'This book has an amazing survival story!';
    await user.type(memoInput, testMemo);

    // Verify the input has the typed text
    expect(memoInput).toHaveValue(testMemo);

    // Find and click the "Add memo" button
    const addButton = screen.getByRole('button', { name: /add memo/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
    
    await user.click(addButton);

    // Wait for the memo text to appear in the "Your memos" section
    await waitFor(() => {
      expect(screen.getByText(testMemo)).toBeInTheDocument();
    });

    // Verify the empty state message is no longer present
    expect(screen.queryByText(/Save your memos to build a running log/i)).not.toBeInTheDocument();

    // Verify the input is cleared after adding the memo
    expect(memoInput).toHaveValue('');
  });
});

