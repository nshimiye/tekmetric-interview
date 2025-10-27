import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  searchBooks,
  setSearchTerm,
  clearSearch as clearSearchAction,
  selectSearchTerm,
} from '../../store/slices/searchSlice';
import type { AppDispatch } from '../../store';

export function useSearch() {
  const dispatch = useDispatch<AppDispatch>();
  const searchTerm = useSelector(selectSearchTerm);
  const activeRequest = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (activeRequest.current) {
        activeRequest.current.abort();
      }
    },
    [],
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    dispatch(setSearchTerm(value));
  };

  const clearSearch = () => {
    if (activeRequest.current) {
      activeRequest.current.abort();
      activeRequest.current = null;
    }

    dispatch(clearSearchAction());
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchTerm.trim();
    if (query.length === 0) {
      clearSearch();
      return;
    }

    if (activeRequest.current) {
      activeRequest.current.abort();
    }

    const controller = new AbortController();
    activeRequest.current = controller;

    try {
      await dispatch(searchBooks(query)).unwrap();
    } catch (error) {
      // Error is handled by the slice
      if (error && typeof error === 'object' && 'name' in error && error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
      }
    }
  };

  return {
    searchTerm,
    handleSearchChange,
    handleSearchSubmit,
  };
}

