import { API_BASE_URL, assertApiResponseOk, isPlainObject } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

const usersUrl = (): string => `${API_BASE_URL}/auth/users`;
const sessionUrl = (): string => `${API_BASE_URL}/auth/session`;

const parseUsersResponse = async (response: Response): Promise<User[]> => {
  const payload = (await response.json()) as unknown;
  if (!isPlainObject(payload)) {
    return [];
  }

  const candidates = payload.users;
  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates as User[];
};

const parseSessionResponse = async (response: Response): Promise<User | null> => {
  const payload = (await response.json()) as unknown;
  if (!isPlainObject(payload)) {
    return null;
  }

  const { user } = payload;
  if (user === null) {
    return null;
  }

  if (!isPlainObject(user)) {
    return null;
  }

  return user as User;
};

export const loadUsers = async (): Promise<User[]> => {
  const response = await fetch(usersUrl());
  await assertApiResponseOk(response);
  return parseUsersResponse(response);
};

export const saveUsers = async (users: User[]): Promise<void> => {
  const response = await fetch(usersUrl(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ users }),
  });

  await assertApiResponseOk(response);
};

export const loadCurrentUser = async (): Promise<User | null> => {
  const response = await fetch(sessionUrl());
  await assertApiResponseOk(response);

  if (response.status === 204) {
    return null;
  }

  return parseSessionResponse(response);
};

export const saveCurrentUser = async (user: User | null): Promise<void> => {
  if (!user) {
    await clearCurrentUser();
    return;
  }

  const response = await fetch(sessionUrl(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user }),
  });

  await assertApiResponseOk(response);
};

export const clearCurrentUser = async (): Promise<void> => {
  const response = await fetch(sessionUrl(), {
    method: 'DELETE',
  });

  if (response.status === 204) {
    return;
  }

  await assertApiResponseOk(response);
};
