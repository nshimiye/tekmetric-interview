import { useMemo, useCallback, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectLibrary,
  ensureBookInLibrary as ensureBookInLibraryAction,
  LibraryBook,
} from '../../store/slices/librarySlice';
import {
  selectLastSearchQuery,
  searchBooks,
  BookSearchResult,
} from '../../store/slices/searchSlice';
import { AppDispatch } from '../../store';

export function useHomeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state for welcome search
  const [welcomeSearchTerm, setWelcomeSearchTerm] = useState('');

  // Redux state
  const library = useSelector(selectLibrary);
  const lastSearchQuery = useSelector(selectLastSearchQuery);

  // Derived state
  const savedBooks = useMemo(
    () =>
      Object.values(library).filter(
        (entry) => entry && entry.book && entry.book.id,
      ),
    [library],
  );

  const savedBookIds = useMemo(
    () => new Set(savedBooks.map((entry) => entry.book.id)),
    [savedBooks],
  );

  // Redux actions
  const ensureBookInLibrary = useCallback(
    (book: BookSearchResult | LibraryBook) => {
      dispatch(ensureBookInLibraryAction(book));
      return book;
    },
    [dispatch],
  );

  // Event handlers
  const handleNavigateToBook = (book: BookSearchResult | LibraryBook) => {
    if (!book) {
      return;
    }

    const normalized = ensureBookInLibrary(book);
    const targetId = normalized?.id ?? book.id;
    if (!targetId) {
      return;
    }

    navigate(`/books/${targetId}`);
  };

  const handleAddMemoFromSearch = (book: BookSearchResult) => {
    handleNavigateToBook(book);
  };

  const handleAddToShelfFromSearch = (book: BookSearchResult) => {
    ensureBookInLibrary(book);
  };

  const handleWelcomeSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWelcomeSearchTerm(event.target.value);
  };

  const handleWelcomeSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const query = welcomeSearchTerm.trim();
    if (query.length === 0) {
      return;
    }

    try {
      await dispatch(searchBooks(query)).unwrap();
      // Scroll to top to see search results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // Error is handled by the slice
      console.error('Search error:', error);
    }
  };

  return {
    savedBooks,
    savedBookIds,
    lastSearchQuery,
    welcomeSearchTerm,
    handleAddMemoFromSearch,
    handleAddToShelfFromSearch,
    handleNavigateToBook,
    handleWelcomeSearchChange,
    handleWelcomeSearchSubmit,
  };
}

