const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';

const resolveApiBaseUrl = (): string => {
  const raw = (import.meta.env?.VITE_LIBRARY_API_BASE_URL ?? '').toString().trim();
  const url = raw.length > 0 ? raw : DEFAULT_API_BASE_URL;
  return url.replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBaseUrl();

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const assertApiResponseOk = async (response: Response): Promise<void> => {
  if (response.ok) {
    return;
  }

  let detail = '';
  try {
    const payload = await response.json();
    if (isPlainObject(payload) && typeof payload.message === 'string') {
      detail = `: ${payload.message}`;
    }
  } catch {
    // ignore json parse errors
  }

  throw new Error(`API request failed (${response.status})${detail}`);
};

