import type { Article, ValidationError } from '../news/types';

/**
 * The admin's only door to the content: every call carries the session token
 * the development server wrote into the page, and every failure comes back as
 * an error — a save is never reported as done unless the server said so.
 */
const token =
  document.querySelector<HTMLMetaElement>('meta[name="avyor-admin-token"]')?.content ?? '';

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
