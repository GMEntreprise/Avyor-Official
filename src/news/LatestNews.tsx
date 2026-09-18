import { ArrowUpRight } from 'lucide-react';
import { useHref, useSite } from '../content/context';
import { NewsCard } from './NewsCard';

/** The latest articles on the home page — shown only once there are some. */
export function LatestNews() {
  const { content, news } = useSite();
  const href = useHref();
  if (!news.enabled || !news.latest?.length) return null;
  const ui = content.ui.news;
  return (
    <section className="latest-news container" aria-labelledby="latest-news-title">
      <div className="section-heading">
        <p className="eyebrow">{ui.latestEyebrow}</p>
        <h2 id="latest-news-title">{ui.latestTitle}</h2>
      </div>
      <div className="news-grid">
        {news.latest.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
      <a className="text-link" href={href('news')}>
        {ui.latestLink} <ArrowUpRight size={17} />
      </a>
    </section>
  );
}
