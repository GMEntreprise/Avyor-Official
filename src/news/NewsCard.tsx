import { useHref, useSite } from '../content/context';
import { formatDate } from './format';
import type { ArticleSummary } from './types';

/**
 * One article in a list.
 *
 * The title is the link, stretched over the whole card by CSS; the theme is a
 * separate link to the filtered list, drawn above that surface. Two links side
 * by side, never one inside the other.
 */
export function NewsCard({
  article,
  featured = false,
  priority = false,
  headingLevel = 3,
}: {
  article: ArticleSummary;
  featured?: boolean;
  priority?: boolean;
  headingLevel?: 2 | 3;
}) {
  const { content } = useSite();
  const ui = content.ui.news;
  const href = useHref();
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <article className={`news-card${featured ? ' news-card-featured' : ''}`}>
      <div className="news-card-media">
        <img
          src={article.cover.src}
          alt=""
          width={article.cover.width}
          height={article.cover.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
        />
      </div>
      <div className="news-card-body">
        <p className="news-card-meta">
          {featured && <span className="news-card-badge">{ui.featured}</span>}
          <a className="news-card-theme" href={`${href('news')}?theme=${article.theme}`}>
            {ui.themes[article.theme]}
          </a>
          <span aria-hidden="true">·</span>
          <span>{ui.audiences[article.audience]}</span>
        </p>
        <Heading>
          <a className="news-card-link" href={href(`news/${article.slug}`)}>
            {article.title}
          </a>
        </Heading>
        <p className="news-card-excerpt">{article.excerpt}</p>
        <p className="news-card-footer">
          <time dateTime={article.publishedAt} suppressHydrationWarning>
            {formatDate(article.publishedAt, ui.dateLocale)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{ui.readingTime(article.readingMinutes)}</span>
        </p>
      </div>
    </article>
  );
}
