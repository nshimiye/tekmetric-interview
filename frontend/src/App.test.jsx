import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import theme from './styles/theme';

const renderWithProviders = (initialEntries = ['/']) =>
  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MemoryRouter
        initialEntries={initialEntries}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const registerTestAccount = async (user) => {
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/^email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    const createButton = screen.getByRole('button', { name: /create account/i });
    await user.click(createButton);

    await screen.findByRole('heading', { level: 2, name: /suggested books/i });
  };

  it('follows the suggested books flow to add memos', async () => {
    const user = userEvent.setup();
    renderWithProviders(['/register']);
    await registerTestAccount(user);

    expect(
      screen.getByRole('heading', { level: 2, name: /suggested books/i }),
    ).toBeInTheDocument();

    const hailMaryHeading = screen.getByRole('heading', {
      level: 3,
      name: /project hail mary/i,
    });
    const hailMaryCard = hailMaryHeading.closest('article');
    expect(hailMaryCard).not.toBeNull();

    const memoButton = within(hailMaryCard).getByRole('button', {
      name: /\+ memo/i,
    });
    await user.click(memoButton);

    expect(
      screen.getByRole('heading', { level: 2, name: /project hail mary/i }),
    ).toBeInTheDocument();

    const memoField = screen.getByLabelText(/your notes/i);
    await user.clear(memoField);
    await user.type(memoField, 'Loved the problem-solving scenes.');

    const addButton = screen.getByRole('button', { name: /add memo/i });
    expect(addButton).not.toBeDisabled();

    await user.click(addButton);

    expect(
      await screen.findByText(/memo added/i),
    ).toBeInTheDocument();
    const memoList = await screen.findByRole('list', { name: /saved memos/i });
    expect(
      within(memoList).getAllByRole('listitem'),
    ).toHaveLength(1);
    expect(
      within(memoList).getByText('Loved the problem-solving scenes.'),
    ).toBeInTheDocument();

    await user.type(memoField, 'Great worldbuilding throughout Arrakis.');
    expect(addButton).not.toBeDisabled();
    await user.click(addButton);

    expect(
      await screen.findByText(/memo added/i),
    ).toBeInTheDocument();
    expect(
      within(memoList).getAllByRole('listitem'),
    ).toHaveLength(2);
    expect(
      within(memoList).getByText('Great worldbuilding throughout Arrakis.'),
    ).toBeInTheDocument();

  });

  it('searches Google Books and saves a memo from results', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'test-volume',
            volumeInfo: {
              title: 'Dune',
              authors: ['Frank Herbert'],
              description: 'A desert planet epic.',
              imageLinks: {
                thumbnail: 'https://example.com/dune.jpg',
              },
              infoLink: 'https://books.google.com/dune',
              publishedDate: '1965',
            },
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    try {
      renderWithProviders(['/register']);
      await registerTestAccount(user);

      const searchField = screen.getByRole('searchbox', { name: /search books/i });
      await user.type(searchField, 'Dune');

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [requestUrl, fetchOptions] = fetchMock.mock.calls[0];
      expect(requestUrl).toContain('https://www.googleapis.com/books/v1/volumes?q=Dune');
      expect(fetchOptions).toHaveProperty('signal');

      expect(
        await screen.findByRole('heading', { level: 2, name: /results for "dune"/i }),
      ).toBeInTheDocument();
      const resultHeading = await screen.findByRole('heading', {
        level: 3,
        name: /dune/i,
      });
      expect(
        screen.getByText(/view on google books/i),
      ).toHaveAttribute('href', 'https://books.google.com/dune');

      const resultCard = resultHeading.closest('article');
      expect(resultCard).not.toBeNull();

      const addMemoFromSearch = within(resultCard).getByRole('button', {
        name: /add memo/i,
      });
      await user.click(addMemoFromSearch);

      expect(
        await screen.findByRole('heading', { level: 2, name: /dune/i }),
      ).toBeInTheDocument();

      const memoField = screen.getByLabelText(/your notes/i);
      await user.type(memoField, 'Thinking about spice.');
      const addMemoButton = screen.getByRole('button', { name: /^add memo$/i });
      await user.click(addMemoButton);

      expect(
        await screen.findByText(/memo added/i),
      ).toBeInTheDocument();

      const homeLink = screen.getByRole('link', { name: /book memo/i });
      await user.click(homeLink);

      const bookshelfList = await screen.findByRole('list', {
        name: /your saved books/i,
      });
      const shelfItems = within(bookshelfList).getAllByRole('listitem');
      const shelfCard = shelfItems.find((item) => {
        const heading = within(item).queryByRole('heading', {
          level: 3,
          name: /dune/i,
        });
        return Boolean(heading);
      });

      expect(shelfCard, 'Expected to find a bookshelf card for Dune').toBeDefined();
      expect(
        within(shelfCard).getByText(/1 memo/i),
      ).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('redirects unauthenticated users to the sign-in screen', () => {
    renderWithProviders(['/']);
    expect(
      screen.getByRole('heading', { level: 1, name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });
});
