import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
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
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('App', () => {
  it('follows the suggested books flow to add memos', async () => {
    const user = userEvent.setup();
    renderWithProviders(['/']);

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
      await screen.findByRole('heading', { level: 1, name: /reading notebook/i }),
    ).toBeInTheDocument();

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

    const duneLink = screen.getByRole('link', { name: /dune/i });
    await user.click(duneLink);

    expect(
      screen.getByRole('heading', { level: 2, name: /dune/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/your notes/i)).toHaveValue('');
    expect(
      screen.queryByRole('list', { name: /saved memos/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/save your memos to build a running log/i),
    ).toBeInTheDocument();

    const hailMaryLink = screen.getByRole('link', {
      name: /project hail mary/i,
    });
    await user.click(hailMaryLink);

    const restoredMemoList = await screen.findByRole('list', {
      name: /saved memos/i,
    });
    expect(
      within(restoredMemoList).getAllByRole('listitem'),
    ).toHaveLength(2);
  });

  it('searches Google Books and displays results', async () => {
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
      renderWithProviders(['/']);

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
      expect(
        await screen.findByRole('heading', { level: 3, name: /dune/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/view on google books/i),
      ).toHaveAttribute('href', 'https://books.google.com/dune');

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      expect(
        await screen.findByRole('heading', { level: 2, name: /suggested books/i }),
      ).toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
