import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from './ui/button';
import { pages, hrefFor } from '../content/site';
import { suggestRoute } from '../lib/suggest-route';

/** Where a lost visitor most plausibly wanted to go, in reading order. */
const destinations = ['features', 'creators', 'brands', 'how-it-works', 'faq', 'download']
  .map((slug) => pages.find((p) => p.slug === slug))
  .filter((p): p is (typeof pages)[number] => Boolean(p));

/**
 * The page served for any address that does not exist.
 *
 * It is prerendered once, for a placeholder path, and then served for every
 * unknown address. So the requested path and the page it resembles are only
 * worked out after mounting: rendering them on the first pass would make the
 * browser's markup differ from the server's and break hydration.
 */
export function NotFound() {
  const [requested, setRequested] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<(typeof pages)[number] | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    setRequested(path);
    const slug = suggestRoute(
      path,
      pages.filter((p) => p.slug && !p.noindex),
    );
    setSuggestion(pages.find((p) => p.slug === slug) ?? null);
  }, []);

  return (
    <section className="not-found container">
      <p className="eyebrow">404 — HORS CHAMP</p>
      <h1>Cette page n’est plus dans le cadre.</h1>
      <p className="not-found-lead">
        {requested ? (
          <>
            L’adresse <code>{requested}</code> ne mène à aucune page d’AVYOR.
          </>
        ) : (
          'Cette adresse ne mène à aucune page d’AVYOR.'
        )}
      </p>

      {suggestion && (
        <a className="not-found-suggestion" href={hrefFor(suggestion.slug)}>
          <span>Vous cherchiez peut-être</span>
          <strong>
            {suggestion.label} <ArrowUpRight size={20} aria-hidden="true" />
          </strong>
        </a>
      )}

      <div className="not-found-actions">
        <Button asChild>
          <a href="/">
            Revenir à l’accueil <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </Button>
        <a className="text-link" href="/contact/">
          Signaler un lien cassé <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>

      <nav className="not-found-destinations" aria-label="Pages principales">
        <p className="eyebrow">OU REPARTEZ D’ICI</p>
        <ul>
          {destinations.map((page) => (
            <li key={page.slug}>
              <a href={hrefFor(page.slug)}>
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
