const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';

const resolveApiBaseUrl = (): string => {
  const raw = (import.meta.env?.VITE_LIBRARY_API_BASE_URL ?? '').toString().trim();
  const url = raw.length > 0 ? raw : DEFAULT_API_BASE_URL;
  return url.replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBaseUrl();
