import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import App from './App';
import type { PublicUser } from './auth/AuthContext';
import { useAuth } from './auth/AuthContext';
import libraryReducer, { loadLibrary } from './store/slices/librarySlice';
import publicMemosReducer from './store/slices/publicMemosSlice';
import searchReducer from './store/slices/searchSlice';
import theme from './styles/theme';
import en from './i18n/locales/en.json';

// Mock the auth hook
vi.mock('./auth/AuthContext', () => ({
  useAuth: vi.fn(),
  PublicUser: undefined,
}));

// Mock the library storage functions
vi.mock('./library/libraryStorage', () => ({
  loadUserLibrary: vi.fn(() => ({})),
  saveUserLibrary: vi.fn(),
  Memo: undefined,
  UserLibrary: undefined,
}));

// Mock the public memos storage
vi.mock('./library/publicMemoStorage', () => ({
  loadPublicMemoStore: vi.fn(() => ({})),
  savePublicMemoStore: vi.fn(),
  normalizePublicMemoStore: vi.fn((store) => store),
  getPublicMemosForBook: vi.fn(() => []),
}));

// Mock the auth storage
vi.mock('./auth/authStorage', () => ({
  getStoredUser: vi.fn(() => null),
  setStoredUser: vi.fn(),
  clearStoredUser: vi.fn(),
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

describe('App - Search Feature', () => {
  beforeAll(() => {
    // Initialize i18n for tests
    i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
  });

  beforeEach(() => {
    // Mock the useAuth hook to return an authenticated user
    mockedUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should display search results panel when user searches for a book', async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    // Render the full App with all necessary providers
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <MemoryRouter 
              initialEntries={['/']}
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <App />
            </MemoryRouter>
          </ThemeProvider>
        </I18nextProvider>
      </Provider>
    );

    // Find the search input in the header by its ID
    const searchInput = document.getElementById('book-search-input');
    expect(searchInput).toBeInTheDocument();

    // Type a search term and press Enter
    await user.type(searchInput!, 'React{Enter}');

    // Wait for the "Clear search" button to appear, which indicates the search results panel is visible
    await waitFor(
      () => {
        const clearButton = screen.getByText(/clear search/i);
        expect(clearButton).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});

