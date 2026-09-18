import { AUDIENCES, THEMES } from './model.ts';

/**
 * The state of the News list, as written in its URL.
 *
 * Filters and search live in the query string so they survive a reload, a
 * shared link and the back button. Unknown values are dropped rather than
 * trusted: `?theme=<script>` is simply no theme.
 */
export interface NewsQuery {
  q: string;
  audience: string;
  theme: string;
  page: number;
}

export const emptyQuery: NewsQuery = { q: '', audience: '', theme: '', page: 1 };

export function parseQuery(search: string): NewsQuery {
  const params = new URLSearchParams(search);
  const audience = params.get('audience') ?? '';
  const theme = params.get('theme') ?? '';
  const page = Number.parseInt(params.get('page') ?? '1', 10);
  return {
    q: (params.get('q') ?? '').slice(0, 120).trim(),
    audience: (AUDIENCES as string[]).includes(audience) ? audience : '',
    theme: (THEMES as string[]).includes(theme) ? theme : '',
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

/** Only the parameters that change something, in a fixed order. */
export function toSearch(query: NewsQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.audience) params.set('audience', query.audience);
  if (query.theme) params.set('theme', query.theme);
  if (query.page > 1) params.set('page', String(query.page));
  const value = params.toString();
  return value ? `?${value}` : '';
}

export const isFiltered = (query: NewsQuery) =>
  Boolean(query.q || query.audience || query.theme || query.page > 1);

/**
 * A new filter starts from the first page: page 3 of one search means nothing
 * in another.
 */
export const withFilter = (query: NewsQuery, change: Partial<Omit<NewsQuery, 'page'>>) => ({
  ...query,
  ...change,
  page: 1,
});
