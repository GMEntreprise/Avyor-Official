import { LegalTableOfContents } from './LegalTableOfContents';
import { config } from '../config';
import { useHref, useSite } from '../content/context';
import type { LegalDoc } from '../content/types';
import { DEFAULT_LOCALE } from '../i18n/locales';

export type { LegalDoc, LegalSection } from '../content/types';

/** The documents a legal page always points to, by slug. */
const CROSSLINKS = ['privacy', 'terms', 'legal', 'security'];

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const { content, locale } = useSite();
  const ui = content.ui.legal;
  const href = useHref();
  const pending = doc.sections.filter((s) => s.todo).length;
  const labelOf = (slug: string) => content.pages.find((p) => p.slug === slug)?.label ?? slug;
  return (
    <div className="legal-layout">
      <LegalTableOfContents items={doc.sections.map(({ id, title }) => ({ id, title }))} />
      <div className="legal-document">
        <p className="legal-updated">
          {ui.updated} {doc.lastUpdated}.
        </p>
        {/* A translated legal document is a reading aid; the French text is
            the one that binds. Saying so is the honest thing to display. */}
        {locale !== DEFAULT_LOCALE && ui.translationNotice && (
          <p className="legal-translation">{ui.translationNotice}</p>
        )}
        <p className="legal-intro">{doc.intro}</p>
        {pending > 0 && (
          <aside className="legal-notice">
            <strong>{ui.noticeTitle}</strong>
            <p>{ui.notice(pending)}</p>
          </aside>
        )}
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.body && <p>{section.body}</p>}
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.todo && (
              <p className="legal-todo">
                <strong>{ui.todoLabel}</strong> {section.todo}
              </p>
            )}
          </section>
        ))}
        <section id="contact-document">
          <h2>{ui.contactTitle}</h2>
          <p>
            {ui.contactLead} <a href={`mailto:${config.email}`}>{config.email}</a>.
          </p>
          <p className="legal-crosslinks">
            {CROSSLINKS.map((slug) => (
              <a key={slug} href={href(slug)}>
                {labelOf(slug)}
              </a>
            ))}
          </p>
        </section>
      </div>
    </div>
  );
}
