import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useHref, useSite } from '../content/context';
import { NewsCard } from './NewsCard';
import { paginate, searchArticles } from './model';
import { emptyQuery, isFiltered, parseQuery, toSearch, withFilter, type NewsQuery } from './query';
import type { NewsIndexData } from './build';
import type { ArticleSummary, SearchEntry } from './types';

type SearchItem = ArticleSummary & SearchEntry;

/**
 * The News list.
 *
 * Served as finished HTML — page 1 at /news/, the next pages at
 * /news/page/2/ and so on, all real links a crawler can follow. Search and
 * filters are a layer on top: they read their state from the query string and
 * search the whole published corpus, loaded once from search.json — never
 * only the cards already on screen.
 */
export function NewsIndex({ data }: { data: NewsIndexData }) {
  const { content } = useSite();
  const ui = content.ui.news;
  const href = useHref();
  const base = href('news');
  const indexUrl = `${base}search.json`;

  // The first render matches the server exactly; the URL is read afterwards.
  const [query, setQuery] = useState<NewsQuery>(emptyQuery);
  const [text, setText] = useState('');
  const [corpus, setCorpus] = useState<SearchItem[] | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const ticket = useRef(0);
  const typing = useRef<number | undefined>(undefined);

  /**
   * Loads the published corpus. Each call takes a ticket; a response whose
   * ticket is no longer the latest is dropped, so a slow early request can
   * never overwrite a newer one.
   */
  const load = async () => {
    const mine = ++ticket.current;
    setStatus('loading');
    try {
      const response = await fetch(indexUrl, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(String(response.status));
      const items = (await response.json()) as SearchItem[];
      if (mine !== ticket.current) return;
      setCorpus(items);
      setStatus('idle');
    } catch {
      if (mine === ticket.current) setStatus('error');
    }
  };

  const apply = (next: NewsQuery, push = true) => {
    setQuery(next);
    if (push) history.pushState(null, '', `${base}${toSearch(next)}`);
    if (isFiltered(next) && !corpus && status !== 'loading') void load();
  };

  useEffect(() => {
    const read = () => {
      const next = parseQuery(window.location.search);
      setQuery(next);
      setText(next.q);
      if (isFiltered(next)) void load();
    };
    read();
    // The back button restores the previous search, not the previous page.
    addEventListener('popstate', read);
    return () => {
      removeEventListener('popstate', read);
      window.clearTimeout(typing.current);
    };
    // Mounted once: `load` reads refs and setters only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onType = (value: string) => {
    setText(value);
    window.clearTimeout(typing.current);
    typing.current = window.setTimeout(() => apply(withFilter(query, { q: value.trim() })), 250);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    window.clearTimeout(typing.current);
    apply(withFilter(query, { q: text.trim() }));
  };

  const filtered = isFiltered(query);
  const matches = corpus ? searchArticles(corpus, query) : null;
  const slice = matches ? paginate(matches, query.page) : null;

  return (
    <section className="news-index container">
      <header className="news-index-header">
        <p className="eyebrow">{ui.eyebrow}</p>
        <h1>{ui.label}</h1>
        <p className="page-intro">{ui.intro}</p>
      </header>

      <form className="news-filters" role="search" action={base} method="get" onSubmit={onSubmit}>
        <div className="news-search">
          <label htmlFor="news-q">{ui.searchLabel}</label>
          <div>
            <input
              id="news-q"
              name="q"
              type="search"
              value={text}
              placeholder={ui.searchPlaceholder}
              autoComplete="off"
              onChange={(event) => onType(event.target.value)}
            />
            <button type="submit">{ui.submit}</button>
          </div>
        </div>
        {data.audiences.length > 1 && (
          <label className="news-select">
            <span>{ui.audienceLabel}</span>
            <select
              name="audience"
              value={query.audience}
              onChange={(event) => apply(withFilter(query, { audience: event.target.value }))}
            >
              <option value="">{ui.all}</option>
              {data.audiences.map((audience) => (
                <option key={audience} value={audience}>
                  {ui.audiences[audience]}
                </option>
              ))}
            </select>
          </label>
        )}
        {data.themes.length > 1 && (
          <label className="news-select">
            <span>{ui.themeLabel}</span>
            <select
              name="theme"
              value={query.theme}
              onChange={(event) => apply(withFilter(query, { theme: event.target.value }))}
            >
              <option value="">{ui.all}</option>
              {data.themes.map((theme) => (
                <option key={theme} value={theme}>
                  {ui.themes[theme]}
                </option>
              ))}
            </select>
          </label>
        )}
      </form>

      <p className="news-status" role="status" aria-live="polite">
        {filtered && status === 'loading' && ui.loading}
        {filtered && status === 'idle' && matches && ui.results(matches.length)}
      </p>

      {filtered && status === 'error' && (
        <div className="news-message" role="alert">
          <p>{ui.error}</p>
          <button type="button" className="text-link" onClick={() => void load()}>
            {ui.retry}
          </button>
        </div>
      )}

      {filtered && slice ? (
        slice.items.length ? (
          <>
            <div className="news-grid">
              {slice.items.map((article) => (
                <NewsCard key={article.id} article={article} headingLevel={2} />
              ))}
            </div>
            {slice.pages > 1 && (
              <Pagination
                page={slice.page}
                pages={slice.pages}
                link={(page) => `${base}${toSearch({ ...query, page })}`}
                onNavigate={(page) => {
                  apply({ ...query, page });
                  document.querySelector('.news-index-header')?.scrollIntoView();
                }}
              />
            )}
          </>
        ) : (
          <div className="news-message">
            <p>{ui.empty}</p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setText('');
                apply(emptyQuery);
              }}
            >
              {ui.reset}
            </button>
          </div>
        )
      ) : (
        <div className="news-results" aria-busy={filtered && status === 'loading'}>
          {data.featured && <NewsCard article={data.featured} featured priority headingLevel={2} />}
          <div className="news-grid">
            {data.items.map((article, i) => (
              <NewsCard
                key={article.id}
                article={article}
                headingLevel={2}
                priority={!data.featured && i === 0}
              />
            ))}
          </div>
          {data.pages > 1 && (
            <Pagination
              page={data.page}
              pages={data.pages}
              link={(page) => (page === 1 ? base : `${base}page/${page}/`)}
            />
          )}
        </div>
      )}
    </section>
  );
}

/** Previous / next as real links: crawlable, shareable, and fine without JS. */
function Pagination({
  page,
  pages,
  link,
  onNavigate,
}: {
  page: number;
  pages: number;
  link: (page: number) => string;
  onNavigate?: (page: number) => void;
}) {
  const ui = useSite().content.ui.news;
  const go = (target: number) =>
    onNavigate
      ? (event: React.MouseEvent) => {
          event.preventDefault();
          onNavigate(target);
        }
      : undefined;
  return (
    <nav className="news-pagination" aria-label={ui.pagination}>
      {page > 1 ? (
        <a href={link(page - 1)} rel="prev" onClick={go(page - 1)}>
          ← {ui.previous}
        </a>
      ) : (
        <span />
      )}
      <span aria-current="page">{ui.page(page, pages)}</span>
      {page < pages ? (
        <a href={link(page + 1)} rel="next" onClick={go(page + 1)}>
          {ui.next} →
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}
