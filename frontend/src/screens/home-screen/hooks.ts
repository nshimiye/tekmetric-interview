import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { LibraryBook } from '../../store/slices/librarySlice';
import { selectSavedBooks, selectSavedBookIdsArray } from '../../store/slices/librarySlice';
import { addBookToLibrary } from '../../store/thunks/libraryThunks';
import type { BookSearchResult } from '../../store/slices/searchSlice';
import { selectLastSearchQuery } from '../../store/slices/searchSlice';
import { searchBooks } from '../../store/thunks/searchThunks';
import type { AppDispatch } from '../../store';

export function useHomeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state for welcome search
  const [welcomeSearchTerm, setWelcomeSearchTerm] = useState('');

  // Redux state via selectors
  const savedBooks = useSelector(selectSavedBooks);
  const savedBookIdsArray = useSelector(selectSavedBookIdsArray);
  const lastSearchQuery = useSelector(selectLastSearchQuery);
  
  // Memoize Set creation to maintain reference stability
  const savedBookIds = useMemo(
    () => new Set(savedBookIdsArray),
    [savedBookIdsArray]
  );

  // Event handlers
  const handleNavigateToBook = (book: BookSearchResult | LibraryBook) => {
  
    dispatch(addBookToLibrary(book));
    const targetId = book.id;
    if (!targetId) {
      return;
    }

    navigate(`/books/${targetId}`);
  };

  const handleAddMemoFromSearch = (book: BookSearchResult) => {
    handleNavigateToBook(book);
  };

  const handleAddToShelfFromSearch = (book: BookSearchResult) => {
    dispatch(addBookToLibrary(book));
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
