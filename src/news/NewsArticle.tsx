import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useHref, useSite } from '../content/context';
import { Button } from '../components/ui/button';
import { track } from '../lib/track';
import { ArticleBody } from './ArticleBody';
import { ArticleToc } from './ArticleToc';
import { NewsCard } from './NewsCard';
import { formatDate, sameDay } from './format';
import { tableOfContents } from './model';
import type { NewsArticleData, PublicArticle } from './build';

/**
 * One article, as a reader gets it.
 *
 * The text is visible in the delivered HTML and never waits for an animation:
 * no reveal, no parallax, no video behind it. The reading column holds about
 * 65 characters; the table of contents appears as soon as there are two
 * sections to move between.
 */
export function NewsArticle({ data }: { data: NewsArticleData }) {
  const { article, related } = data;
  const { content } = useSite();
  const ui = content.ui.news;
  const href = useHref();
  const toc = tableOfContents(article.body);
  const cta = content.pages.find((page) => page.slug === article.cta.slug);
  const detail = { article: article.id, audience: article.audience };

  useEffect(() => {
    track('news_article_view', { article: article.id, audience: article.audience });
  }, [article.id, article.audience]);

  return (
    <article className="news-article">
      {/*
        One grid: the table of contents runs alongside the whole article on
        wide screens. On narrow ones it falls, in document order, between the
        cover and the text — where a reader decides what to read.
      */}
      <div className={`news-article-layout container${toc.length >= 2 ? ' has-toc' : ''}`}>
        <header className="news-article-header">
          <nav className="breadcrumb" aria-label={content.ui.page.breadcrumb}>
            <a href={href('')}>{content.ui.page.home}</a>
            <span>/</span>
            <a href={href('news')}>{ui.label}</a>
            <span>/</span>
            <span aria-current="page">{article.title}</span>
          </nav>
          <p className="eyebrow">
            {ui.types[article.type]} · {ui.themes[article.theme]}
          </p>
          <h1>{article.title}</h1>
          <p className="news-article-lead">{article.excerpt}</p>
          <Byline article={article} />
        </header>

        {article.cover.src && (
          <figure className="news-article-cover">
            <img
              src={article.cover.src}
              alt={article.cover.alt}
              width={article.cover.width}
              height={article.cover.height}
              fetchPriority="high"
              decoding="async"
            />
            {article.cover.caption && <figcaption>{article.cover.caption}</figcaption>}
          </figure>
        )}

        {toc.length >= 2 && (
          <ArticleToc
            toc={toc}
            label={ui.toc}
            onNavigate={(id) => track('news_toc', { ...detail, section: id })}
          />
        )}
        <div className="news-article-main">
          <ArticleBody
            doc={article.body}
            labels={{ sectionLink: ui.sectionLink, callouts: ui.callouts }}
          />

          {article.sources.length > 0 && (
            <section className="news-sources" aria-labelledby="news-sources-title">
              <h2 id="news-sources-title">{ui.sources}</h2>
              <ol>
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} rel="noopener">
                      {source.title}
                    </a>
                    {source.publisher && <span> — {source.publisher}</span>}
                    {source.accessed && (
                      <span>
                        {' '}
                        ({ui.accessed}{' '}
                        <time dateTime={source.accessed} suppressHydrationWarning>
                          {formatDate(source.accessed, ui.dateLocale)}
                        </time>
                        )
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {cta && (
            <aside className="news-cta">
              <p className="eyebrow">{cta.eyebrow}</p>
              <p className="news-cta-text">{cta.intro}</p>
              <Button asChild>
                <a
                  href={href(cta.slug)}
                  onClick={() => track('news_cta', { ...detail, target: cta.slug })}
                >
                  {article.cta.label} <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </Button>
            </aside>
          )}
          <div id="article-end" />
        </div>
      </div>

      {related.length > 0 && (
        <section className="news-related container" aria-labelledby="news-related-title">
          <h2 id="news-related-title">{ui.related}</h2>
          <div className="news-grid">
            {related.map((item) => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function Byline({ article }: { article: PublicArticle }) {
  const ui = useSite().content.ui.news;
  return (
    <p className="news-byline">
      <span>
        {ui.by} {article.author.name}
      </span>
      <span aria-hidden="true">·</span>
      <span>
        {ui.published}{' '}
        <time dateTime={article.publishedAt} suppressHydrationWarning>
          {formatDate(article.publishedAt, ui.dateLocale)}
        </time>
      </span>
      {/* A same-day correction is not news; a later revision is. */}
      {!sameDay(article.publishedAt, article.updatedAt) && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            {ui.updated}{' '}
            <time dateTime={article.updatedAt} suppressHydrationWarning>
              {formatDate(article.updatedAt, ui.dateLocale)}
            </time>
          </span>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>{ui.readingTime(article.readingMinutes)}</span>
    </p>
  );
}
