import type { Article, ValidationError } from '../news/types';

/**
 * The admin's only door to the content: every call carries the session token,
 * and every failure comes back as an error — a save is never reported as done
 * unless the server said so.
 *
 * The token is not in the page: it is exchanged for the password, once per
 * browser session, and kept in `sessionStorage` so a reload does not ask again
 * while closing the tab does.
 */
const KEY = 'avyor-admin-token';
const read = () => {
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
};
let token = read();

/** Told to the gate when the server stops recognising this session. */
export const SESSION_EVENT = 'avyor-admin-session';

export const hasSession = () => Boolean(token);

export function closeSession() {
  token = '';
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* a browser that refuses storage still works, it just asks each reload */
  }
  dispatchEvent(new Event(SESSION_EVENT));
}

export class ApiError extends Error {
  status: number;
  errors: ValidationError[];
  constructor(status: number, message: string, errors: ValidationError[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/__news/api${path}`, {
      ...init,
      headers: { 'x-avyor-admin': token, ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, 'Le serveur de développement ne répond pas. Est-il lancé ?');
  }
  const data = await response.json().catch(() => ({}));
  // The server no longer knows this session: back to the password, whatever
  // the screen was doing.
  if (response.status === 403 && token && path !== '/session') closeSession();
  if (!response.ok)
    throw new ApiError(response.status, data.message ?? `Erreur ${response.status}.`, data.errors);
  return data as T;
}

const json = (value: unknown): RequestInit => ({
  body: JSON.stringify(value),
  headers: { 'content-type': 'application/json' },
});

export interface Row {
  id: string;
  locale: string;
  title: string;
  slug: string;
  audience: Article['audience'];
  theme: Article['theme'];
  state: 'draft' | 'published' | 'archived';
  pendingChanges: boolean;
  updatedAt: string;
  publishedAt: string | null;
  revision: number;
}

/** A new id, drawn by the editor so that a repeated submission is harmless. */
export function newId() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => alphabet[b % 36]).join('');
}

export const api = {
  /** Exchanges the password for a session token. The password is never stored. */
  openSession: async (password: string) => {
    const { token: granted } = await call<{ token: string }>('/session', {
      method: 'POST',
      ...json({ password }),
    });
    token = granted;
    try {
      sessionStorage.setItem(KEY, granted);
    } catch {
      /* not stored: this tab keeps working, the next reload asks again */
    }
    dispatchEvent(new Event(SESSION_EVENT));
  },
  list: () => call<{ articles: Row[] }>('/articles'),
  read: (id: string) => call<{ published?: Article; draft?: Article }>(`/articles/${id}`),
  create: (id: string, locale: string) =>
    call<Article>('/articles', { method: 'POST', ...json({ id, locale }) }),
  save: (article: Article, expectedRevision: number) =>
    call<Article>(`/articles/${article.id}`, {
      method: 'PUT',
      ...json({ article, expectedRevision }),
    }),
  publish: (id: string) => call<Article>(`/articles/${id}/publish`, { method: 'POST' }),
  unpublish: (id: string) => call<Article>(`/articles/${id}/unpublish`, { method: 'POST' }),
  archive: (id: string) => call<Article>(`/articles/${id}/archive`, { method: 'POST' }),
  duplicate: (id: string, copy: string) =>
    call<Article>(`/articles/${id}/duplicate`, { method: 'POST', ...json({ newId: copy }) }),
  upload: (file: File) =>
    call<{ src: string; width: number; height: number }>('/media', {
      method: 'POST',
      body: file,
      headers: {
        'content-type': 'application/octet-stream',
        'x-filename': encodeURIComponent(file.name),
      },
    }),
};
