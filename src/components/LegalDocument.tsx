import { LegalTableOfContents } from './LegalTableOfContents';
import { config } from '../config';

export interface LegalSection {
  id: string;
  title: string;
  body?: string;
  items?: string[];
  /** What is genuinely unknown today. Shown as such, never filled with a guess. */
  todo?: string;
}
export interface LegalDoc {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const pending = doc.sections.filter((s) => s.todo).length;
  return (
    <div className="legal-layout">
      <LegalTableOfContents items={doc.sections.map(({ id, title }) => ({ id, title }))} />
      <div className="legal-document">
        <p className="legal-updated">Dernière mise à jour : {doc.lastUpdated}.</p>
        <p className="legal-intro">{doc.intro}</p>
        {pending > 0 && (
          <aside className="legal-notice">
            <strong>Document en préparation pour le lancement.</strong>
            <p>
              {pending} section{pending > 1 ? 's' : ''} attend{pending > 1 ? 'ent' : ''} une
              information que l’éditeur doit fournir. Elles sont signalées dans le texte plutôt que
              complétées par approximation.
            </p>
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
                <strong>À compléter avant publication :</strong> {section.todo}
              </p>
            )}
          </section>
        ))}
        <section id="contact-document">
          <h2>Contact</h2>
          <p>
            Pour toute question relative à ce document :{' '}
            <a href={`mailto:${config.email}`}>{config.email}</a>.
          </p>
          <p className="legal-crosslinks">
            <a href="/privacy/">Politique de confidentialité</a>
            <a href="/terms/">Conditions d’utilisation</a>
            <a href="/legal/">Mentions légales</a>
            <a href="/security/">Sécurité &amp; paiements</a>
          </p>
        </section>
      </div>
    </div>
  );
}
