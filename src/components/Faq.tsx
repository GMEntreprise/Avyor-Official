import { Plus, ArrowUpRight } from 'lucide-react';
import { faqs } from '../content/site';
import { ordinal } from '../lib/utils';
export function Faq() {
  return (
    <section className="faq-section container">
      <div className="faq-intro">
        <p className="eyebrow">LES QUESTIONS QUI COMPTENT</p>
        <h2>On en parle ?</h2>
        <p>Un projet commence aussi par les bonnes réponses.</p>
        <a href="/contact/" className="text-link">
          Contacter l’équipe <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="faq-list">
        {faqs.map(({ q, a }, i) => (
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
