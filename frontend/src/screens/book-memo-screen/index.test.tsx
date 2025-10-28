import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, vi } from "vitest";
import BookMemoScreen from "./index";
import { useAuth } from "../../auth/AuthContext";
import libraryReducer from "../../store/slices/librarySlice";
import publicMemosReducer from "../../store/slices/publicMemosSlice";
import searchReducer from "../../store/slices/searchSlice";
import theme from "../../styles/theme";
import loadLibrary from "../../store/thunks/libraryThunks";
import { MOCK_LIBRARY, mockUser, targetBookId } from "./index.mock";

// Mock the auth hook
vi.mock("../../auth/AuthContext", () => ({
  useAuth: vi.fn(),
  PublicUser: undefined,
}));



// Mock the library API functions
vi.mock("../../api/library", () => ({
  loadUserLibrary: vi.fn(async () => MOCK_LIBRARY),
  saveUserLibrary: vi.fn(async () => {}),
  deleteUserLibrary: vi.fn(async () => {}),
  Memo: undefined,
  UserLibrary: undefined,
}));

vi.mock("../../api/publicMemos", () => ({
  savePublicMemoStore: vi.fn(async (store) => store),
  getPublicMemosForBook: vi.fn(async () => ({     
      memos: [],
      pagination: {
      page: 1,
      limit: 10,
      totalCount: 0,
      hasMore: false
    }
   })),
}));

const mockedUseAuth = vi.mocked(useAuth);



// Helper function to create a test store
async function createTestStore(userId = mockUser.id) {
  const store = configureStore({
    reducer: {
      library: libraryReducer,
      search: searchReducer,
      publicMemos: publicMemosReducer,
    },
  });

  // Initialize the library with the test user's ID
  await store.dispatch(loadLibrary({ userId }));
  return store;
}

// Helper function to render the component with all necessary providers
async function renderWithProviders(
  bookId: string,
  userId?: string
) {
  const store = await createTestStore(userId);

  // Mock the useAuth hook to return our mock user
  mockedUseAuth.mockReturnValue({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
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

describe("BookMemoScreen", () => {
  it("should add a memo and display it in the Your memos section", async () => {
    const user = userEvent.setup();

    // Render the component with a valid book ID using sample catalog data
    await renderWithProviders(targetBookId);

    // Verify "Your memos" section exists with the empty state message
    expect(
      screen.getByRole("heading", { name: /memo\.yourMemos/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/memo\.saveYourMemosMessage/i)).toBeInTheDocument();

    // Find the memo input field
    const memoInput = screen.getByPlaceholderText(/What resonated with you/i);
    expect(memoInput).toBeInTheDocument();

    // Type a memo into the input
    const testMemo = "This book has an amazing survival story!";
    await user.type(memoInput, testMemo);

    // Verify the input has the typed text
    expect(memoInput).toHaveValue(testMemo);

    // Find and click the "Add memo" button
    const addButton = screen.getByRole("button", { name: /book\.addMemo/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();

    await user.click(addButton);

    // Wait for the memo text to appear in the "Your memos" section
    await waitFor(() => {
      expect(screen.getByText(testMemo)).toBeInTheDocument();
    });

    // Verify the empty state message is no longer present
    expect(
      screen.queryByText(/memo\.saveYourMemosMessage/i)
    ).not.toBeInTheDocument();

    // Verify the input is cleared after adding the memo
    expect(memoInput).toHaveValue("");
  });
});
