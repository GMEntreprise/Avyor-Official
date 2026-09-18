import { Plus, ArrowUpRight } from 'lucide-react';
import { useHref, useSite } from '../content/context';
import { ordinal } from '../lib/utils';
export function Faq() {
  const { content } = useSite();
  const ui = content.ui.faq;
  const href = useHref();
  return (
    <section className="faq-section container">
      <div className="faq-intro">
        <p className="eyebrow">{ui.eyebrow}</p>
        <h2>{ui.title}</h2>
        <p>{ui.lead}</p>
        <a href={href('contact')} className="text-link">
          {ui.link} <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="faq-list">
        {content.faqs.map(({ q, a }, i) => (
          <details key={q}>
            <summary>
              <span className="faq-index">{ordinal(i)}</span>
              <h3>{q}</h3>
              <Plus size={18} aria-hidden="true" />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
