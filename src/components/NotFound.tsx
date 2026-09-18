import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';
import { useHref, useSite } from '../content/context';
import type { Page } from '../content/types';
import { splitPath } from '../i18n/locales';
import { suggestRoute } from '../lib/suggest-route';

/** Where a lost visitor most plausibly wanted to go, in reading order. */
const ORDER = ['features', 'creators', 'brands', 'how-it-works', 'faq', 'download'];

/**
 * The page served for any address that does not exist.
 *
 * It is prerendered once per language, for a placeholder path, and then served
 * for every unknown address. So the requested path and the page it resembles
 * are only worked out after mounting: rendering them on the first pass would
 * make the browser's markup differ from the server's and break hydration.
 */
export function NotFound() {
  const { content } = useSite();
  const ui = content.ui.notFound;
  const href = useHref();
  const [requested, setRequested] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Page | null>(null);
  const destinations = ORDER.map((slug) => content.pages.find((p) => p.slug === slug)).filter(
    (p): p is Page => Boolean(p),
  );

  useEffect(() => {
    const path = window.location.pathname;
    setRequested(path);
    const slug = suggestRoute(
      // The language prefix is not part of what the visitor mistyped.
      `/${splitPath(path).slug}/`,
      content.pages.filter((p) => p.slug && !p.noindex),
    );
    setSuggestion(content.pages.find((p) => p.slug === slug) ?? null);
  }, [content.pages]);

  return (
    <section className="not-found container">
      <p className="eyebrow">{ui.eyebrow}</p>
      <h1>{ui.title}</h1>
      <p className="not-found-lead">
        {requested ? (
          <>
            {ui.leadAt[0]}
            <code>{requested}</code>
            {ui.leadAt[1]}
          </>
        ) : (
          ui.lead
        )}
      </p>

      {suggestion && (
        <a className="not-found-suggestion" href={href(suggestion.slug)}>
          <span>{ui.suggestion}</span>
          <strong>
            {suggestion.label} <ArrowUpRight size={20} aria-hidden="true" />
          </strong>
        </a>
      )}

      <div className="not-found-actions">
        <Button asChild>
          <a href={href('')}>
            {ui.back} <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </Button>
        <a className="text-link" href={href('contact')}>
          {ui.report} <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>

      <nav className="not-found-destinations" aria-label={ui.destinationsLabel}>
        <p className="eyebrow">{ui.destinationsEyebrow}</p>
        <ul>
          {destinations.map((page) => (
            <li key={page.slug}>
              <a href={href(page.slug)}>
                <span>{page.label}</span>
                <small>{page.description.split('.')[0]}.</small>
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
