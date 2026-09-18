import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { loadContent } from '../content/index';
import { SiteProvider } from '../content/context';
import type { SiteContent } from '../content/types';
import { LOCALES, localeMeta, routeFor, type Locale } from '../i18n/locales';
import { toPublic } from '../news/build';
import { AUDIENCES, THEMES, TYPES, slugify, validateArticle } from '../news/model';
import { NewsArticle } from '../news/NewsArticle';
import type { Article, ValidationError } from '../news/types';
import { api, ApiError, newId, type Row } from './api';
import { RichEditor } from './RichEditor';

/**
 * The local News admin.
 *
 * One screen lists every article with its real state; another edits one of
 * them. Saving writes a draft; publishing writes the public version — both
 * only after the server confirmed. Nothing here is shown on the deployed site.
 */
const STATE_LABEL: Record<Row['state'], string> = {
  draft: 'Brouillon',
  published: 'En ligne',
  archived: 'Archivé',
};

export function AdminApp() {
  const [open, setOpen] = useState<string | null>(() =>
    new URLSearchParams(location.search).get('article'),
  );
  useEffect(() => {
    const url = open ? `/admin/?article=${open}` : '/admin/';
    if (location.pathname + location.search !== url) history.pushState(null, '', url);
  }, [open]);
  useEffect(() => {
    const sync = () => setOpen(new URLSearchParams(location.search).get('article'));
    addEventListener('popstate', sync);
    return () => removeEventListener('popstate', sync);
  }, []);
  return (
    <div className="admin">
      <header className="admin-header">
        <a href="/admin/" onClick={(e) => (e.preventDefault(), setOpen(null))}>
          <strong>AVYOR</strong> · Admin News
        </a>
        <span className="admin-local">Local — jamais publié tel quel</span>
      </header>
      {open ? (
        <ArticleEditor key={open} id={open} onClose={() => setOpen(null)} onOpen={setOpen} />
      ) : (
        <ArticleList onOpen={setOpen} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Liste */

function ArticleList({ onOpen }: { onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [locale, setLocale] = useState<Locale>('fr');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setError('');
    api.list().then(
      (data) => setRows(data.articles),
      (failure: Error) => setError(failure.message),
    );
  }, []);
  useEffect(load, [load]);

  const create = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const article = await api.create(newId(), locale);
      onOpen(article.id);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="admin-main">
      <div className="admin-list-head">
        <h1>Articles</h1>
        <div className="admin-create">
          <label>
            <span className="sr-only">Langue du nouvel article</span>
            <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {localeMeta[l].label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="admin-primary" onClick={create} disabled={creating}>
            {creating ? 'Création…' : 'Nouvel article'}
          </button>
        </div>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error}{' '}
          <button type="button" onClick={load}>
            Réessayer
          </button>
        </p>
      )}
      {!rows && !error && <p role="status">Chargement…</p>}
      {rows && rows.length === 0 && <p>Aucun article pour l’instant.</p>}
      {rows && rows.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Titre</th>
              <th scope="col">Langue</th>
              <th scope="col">État</th>
              <th scope="col">Modifié</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <a
                    href={`/admin/?article=${row.id}`}
                    onClick={(e) => (e.preventDefault(), onOpen(row.id))}
                  >
                    {row.title || '(sans titre)'}
                  </a>
                  <small>/{row.slug || '…'}/</small>
                </td>
                <td>{row.locale.toUpperCase()}</td>
                <td>
                  <span className={`admin-badge admin-badge-${row.state}`}>
                    {STATE_LABEL[row.state]}
                  </span>
                  {row.pendingChanges && (
                    <span className="admin-badge admin-badge-pending">
                      Modifications en attente
                    </span>
                  )}
                </td>
                <td>{new Date(row.updatedAt).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

/* ---------------------------------------------------------------- Édition */

type Notice = { kind: 'success' | 'error' | 'info'; text: string; action?: ReactNode };

function ArticleEditor({
  id,
  onClose,
  onOpen,
}: {
  id: string;
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  const [article, setArticle] = useState<Article | null>(null);
  const [online, setOnline] = useState<Article | undefined>();
  const [saved, setSaved] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [serverErrors, setServerErrors] = useState<ValidationError[]>([]);
  const [others, setOthers] = useState<Row[]>([]);
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);

  const load = useCallback(async () => {
    try {
      const found = await api.read(id);
      const current = found.draft ?? found.published;
      if (!current) throw new ApiError(404, 'Article introuvable.');
      setArticle(current);
      setOnline(found.published);
      setSaved(JSON.stringify(current));
      setNotice(null);
      setServerErrors([]);
      setOthers((await api.list()).articles.filter((row) => row.id !== id));
    } catch (failure) {
      setNotice({ kind: 'error', text: (failure as Error).message });
    }
  }, [id]);
  useEffect(() => void load(), [load]);

  useEffect(() => {
    if (article) void loadContent[article.locale as Locale]().then(setContent);
  }, [article?.locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = article ? JSON.stringify(article) !== saved : false;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);

  // What publication will require, shown while writing rather than at the end.
  const checks = useMemo(
    () => (article ? validateArticle(article, { publishing: true }) : []),
    [article],
  );
  const errors = serverErrors.length ? serverErrors : [];
  const fieldError = (field: string) =>
    errors.find((e) => e.field === field || e.field.startsWith(`${field}.`))?.message;

  if (!article)
    return (
      <main className="admin-main">
        {notice ? <p className="admin-error">{notice.text}</p> : <p role="status">Chargement…</p>}
      </main>
    );

  const set = <K extends keyof Article>(key: K, value: Article[K]) =>
    setArticle({ ...article, [key]: value });

  /** Runs one server action; the button stays disabled until it answers. */
  const act = async (label: string, task: () => Promise<Notice | void>) => {
    if (pending) return;
    setPending(label);
    setNotice(null);
    try {
      const result = await task();
      if (result) setNotice(result);
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 409)
        setNotice({
          kind: 'error',
          text: failure.message,
          action: (
            <button type="button" onClick={() => void load()}>
              Recharger la dernière version
            </button>
          ),
        });
      else {
        if (failure instanceof ApiError) setServerErrors(failure.errors);
        setNotice({ kind: 'error', text: (failure as Error).message });
      }
    } finally {
      setPending(null);
    }
  };

  const save = async () => {
    const next = await api.save(article, article.revision);
    setArticle(next);
    setSaved(JSON.stringify(next));
    setServerErrors([]);
    return next;
  };

  const actions = {
    save: () =>
      act('save', async () => {
        await save();
        return {
          kind: 'success',
          text: `Brouillon enregistré à ${new Date().toLocaleTimeString('fr-FR')}.`,
        };
      }),
    publish: () =>
      act('publish', async () => {
        if (dirty) await save();
        const published = await api.publish(article.id);
        setArticle(published);
        setOnline(published);
        setSaved(JSON.stringify(published));
        return {
          kind: 'success',
          text: `Publié dans content/news/. En ligne après commit et déploiement : ${routeFor(published.locale as Locale, `news/${published.slug}`)}`,
        };
      }),
    unpublish: () =>
      act('unpublish', async () => {
        if (!window.confirm('Retirer cet article du site au prochain déploiement ?')) return;
        const draft = await api.unpublish(article.id);
        setArticle(draft);
        setOnline(undefined);
        setSaved(JSON.stringify(draft));
        return {
          kind: 'success',
          text: 'Dépublié : l’article répondra 404 au prochain déploiement. Son contenu reste en brouillon.',
        };
      }),
    archive: () =>
      act('archive', async () => {
        if (!window.confirm('Archiver cet article ? Il sort du site, son contenu est conservé.'))
          return;
        const archived = await api.archive(article.id);
        setArticle(archived);
        setOnline(undefined);
        setSaved(JSON.stringify(archived));
        return { kind: 'success', text: 'Archivé.' };
      }),
    duplicate: () =>
      act('duplicate', async () => {
        const copy = await api.duplicate(article.id, newId());
        onOpen(copy.id);
      }),
  };

  const pages = content?.pages.filter((p) => p.slug && !p.noindex) ?? [];
  const sameLocale = others.filter((row) => row.locale === article.locale);

  return (
    <main className="admin-main admin-edit">
      <div className="admin-edit-head">
        <button type="button" className="admin-link" onClick={onClose}>
          ← Tous les articles
        </button>
        <p className="admin-state">
          <span
            className={`admin-badge admin-badge-${online ? 'published' : (article.status ?? 'draft')}`}
          >
            {online ? 'En ligne' : STATE_LABEL[article.status ?? 'draft']}
          </span>
          {online && dirty && (
            <span className="admin-badge admin-badge-pending">Non enregistré</span>
          )}
          {online && !dirty && article.basedOnRevision !== undefined && (
            <span className="admin-badge admin-badge-pending">Modifications non publiées</span>
          )}
          <small>Révision {article.revision}</small>
        </p>
      </div>

      <div className="admin-actions" role="group" aria-label="Actions">
        <button
          type="button"
          className="admin-primary"
          disabled={Boolean(pending)}
          onClick={actions.save}
        >
          {pending === 'save' ? 'Enregistrement…' : 'Enregistrer le brouillon'}
        </button>
        <button type="button" aria-pressed={preview} onClick={() => setPreview(!preview)}>
          {preview ? 'Revenir à l’édition' : 'Prévisualiser'}
        </button>
        <button
          type="button"
          className="admin-publish"
          disabled={Boolean(pending) || checks.length > 0}
          title={checks.length ? 'Complétez les points listés avant de publier.' : undefined}
          onClick={actions.publish}
        >
          {pending === 'publish'
            ? 'Publication…'
            : online
              ? 'Publier les modifications'
              : 'Publier'}
        </button>
        {online && (
          <button type="button" disabled={Boolean(pending)} onClick={actions.unpublish}>
            Dépublier
          </button>
        )}
        {article.status !== 'archived' && (
          <button type="button" disabled={Boolean(pending)} onClick={actions.archive}>
            Archiver
          </button>
        )}
        <button type="button" disabled={Boolean(pending)} onClick={actions.duplicate}>
          Dupliquer en brouillon
        </button>
      </div>

      {notice && (
        <p
          className={`admin-notice admin-notice-${notice.kind}`}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          {notice.text} {notice.action}
        </p>
      )}

      {checks.length > 0 && (
        <details className="admin-checks">
          <summary>
            {checks.length} point{checks.length > 1 ? 's' : ''} à compléter avant publication
          </summary>
          <ul>
            {checks.map((check, i) => (
              <li key={i}>
                <code>{check.field}</code> — {check.message}
              </li>
            ))}
          </ul>
        </details>
      )}

      {preview ? (
        content && (
          <div className="admin-preview" lang={localeMeta[article.locale as Locale]?.tag}>
            <p className="admin-preview-banner">Aperçu privé — ce rendu n’est pas publié.</p>
            <SiteProvider
              value={{
                locale: article.locale as Locale,
                content,
                news: { enabled: true },
              }}
            >
              <NewsArticle
                data={{
                  article: toPublic({
                    ...article,
                    publishedAt: article.publishedAt ?? new Date().toISOString(),
                  }),
                  related: [],
                  alternates: [],
                }}
              />
            </SiteProvider>
          </div>
        )
      ) : (
        <div className="admin-form">
          <section>
            <h2>Contenu</h2>
            <Field label="Titre" error={fieldError('title')} hint={`${article.title.length}/140`}>
              <input value={article.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field
              label="Slug (adresse)"
              error={fieldError('slug')}
              hint={
                online && online.slug !== article.slug
                  ? `L’ancienne adresse /news/${online.slug}/ redirigera ici après publication.`
                  : 'Jamais recalculé automatiquement : changer une adresse publiée crée une redirection.'
              }
            >
              <div className="admin-inline">
                <input value={article.slug} onChange={(e) => set('slug', e.target.value)} />
                <button type="button" onClick={() => set('slug', slugify(article.title))}>
                  Depuis le titre
                </button>
              </div>
            </Field>
            <Field
              label="Extrait"
              error={fieldError('excerpt')}
              hint={`${article.excerpt.length}/300 — affiché sous le titre et sur les cartes.`}
            >
              <textarea
                rows={3}
                value={article.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
              />
            </Field>
            <RichEditor
              value={article.body}
              version={`${article.id}:${article.revision}`}
              onChange={(body) =>
                setArticle((current) => (current ? { ...current, body } : current))
              }
              error={fieldError('body')}
            />
          </section>

          <section>
            <h2>Classement</h2>
            <div className="admin-grid">
              <Field label="Langue">
                <select
                  value={article.locale}
                  onChange={(e) => set('locale', e.target.value)}
                  disabled={Boolean(online)}
                >
                  {LOCALES.map((l) => (
                    <option key={l} value={l}>
                      {localeMeta[l].label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <select
                  value={article.type}
                  onChange={(e) => set('type', e.target.value as Article['type'])}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {content?.ui.news.types[t] ?? t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Public">
                <select
                  value={article.audience}
                  onChange={(e) => set('audience', e.target.value as Article['audience'])}
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {content?.ui.news.audiences[a] ?? a}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Thématique">
                <select
                  value={article.theme}
                  onChange={(e) => set('theme', e.target.value as Article['theme'])}
                >
                  {THEMES.map((t) => (
                    <option key={t} value={t}>
                      {content?.ui.news.themes[t] ?? t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={article.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              Mettre à la une de la page News
            </label>
            {article.type === 'product' && (
              <p className="admin-warning">
                Une nouveauté AVYOR ne se publie que pour une fonctionnalité livrée et vérifiée dans
                l’application.
              </p>
            )}
            {article.type === 'case' && (
              <p className="admin-warning">
                Un retour d’expérience ne se publie qu’à partir d’un cas réel, avec l’accord de la
                personne ou de la marque concernée.
              </p>
            )}
          </section>

          <section>
            <h2>Auteur</h2>
            <div className="admin-grid">
              <Field label="Nature">
                <select
                  value={article.author.kind}
                  onChange={(e) =>
                    set('author', {
                      ...article.author,
                      kind: e.target.value as Article['author']['kind'],
                    })
                  }
                >
                  <option value="organization">Équipe (organisation)</option>
                  <option value="person">Personne réelle</option>
                </select>
              </Field>
              <Field label="Nom" error={fieldError('author.name')}>
                <input
                  value={article.author.name}
                  onChange={(e) => set('author', { ...article.author, name: e.target.value })}
                />
              </Field>
              {article.author.kind === 'person' && (
                <Field label="Rôle">
                  <input
                    value={article.author.role ?? ''}
                    onChange={(e) => set('author', { ...article.author, role: e.target.value })}
                  />
                </Field>
              )}
            </div>
          </section>

          <section>
            <h2>Image principale</h2>
            <ImageField
              value={article.cover}
              onChange={(cover) => set('cover', cover)}
              error={fieldError('cover')}
            />
          </section>

          <section>
            <h2>Action en fin d’article</h2>
            <div className="admin-grid">
              <Field label="Page de destination" error={fieldError('cta.slug')}>
                <select
                  value={article.cta.slug}
                  onChange={(e) => set('cta', { ...article.cta, slug: e.target.value })}
                >
                  {pages.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Libellé du bouton" error={fieldError('cta.label')}>
                <input
                  value={article.cta.label}
                  onChange={(e) => set('cta', { ...article.cta, label: e.target.value })}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2>Sources</h2>
            <p className="admin-hint">
              Sources primaires et datées pour toute règle, chiffre ou obligation qui peut changer.
            </p>
            {article.sources.map((source, i) => (
              <div className="admin-source" key={i}>
                <input
                  aria-label="Titre de la source"
                  placeholder="Titre"
                  value={source.title}
                  onChange={(e) =>
                    set(
                      'sources',
                      article.sources.map((s, j) =>
                        j === i ? { ...s, title: e.target.value } : s,
                      ),
                    )
                  }
                />
                <input
                  aria-label="Adresse https"
                  placeholder="https://…"
                  value={source.url}
                  onChange={(e) =>
                    set(
                      'sources',
                      article.sources.map((s, j) => (j === i ? { ...s, url: e.target.value } : s)),
                    )
                  }
                />
                <input
                  aria-label="Éditeur"
                  placeholder="Éditeur"
                  value={source.publisher ?? ''}
                  onChange={(e) =>
                    set(
                      'sources',
                      article.sources.map((s, j) =>
                        j === i ? { ...s, publisher: e.target.value } : s,
                      ),
                    )
                  }
                />
                <input
                  aria-label="Consultée le"
                  type="date"
                  value={source.accessed ?? ''}
                  onChange={(e) =>
                    set(
                      'sources',
                      article.sources.map((s, j) =>
                        j === i ? { ...s, accessed: e.target.value } : s,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      'sources',
                      article.sources.filter((_, j) => j !== i),
                    )
                  }
                >
                  Retirer
                </button>
                {fieldError(`sources.${i}`) && (
                  <p className="admin-error">{fieldError(`sources.${i}`)}</p>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                set('sources', [
                  ...article.sources,
                  { title: '', url: '', accessed: new Date().toISOString().slice(0, 10) },
                ])
              }
            >
              Ajouter une source
            </button>
          </section>

          <section>
            <h2>Lectures liées et traductions</h2>
            <p className="admin-hint">
              Seuls les articles publiés dans la même langue sont proposés au lecteur, trois au
              plus.
            </p>
            <div className="admin-related">
              {sameLocale.length === 0 && <p>Aucun autre article dans cette langue.</p>}
              {sameLocale.map((row) => (
                <label key={row.id} className="admin-check">
                  <input
                    type="checkbox"
                    checked={article.related.includes(row.id)}
                    onChange={(e) =>
                      set(
                        'related',
                        e.target.checked
                          ? [...article.related, row.id]
                          : article.related.filter((r) => r !== row.id),
                      )
                    }
                  />
                  {row.title || '(sans titre)'} — {STATE_LABEL[row.state]}
                </label>
              ))}
            </div>
            <div className="admin-grid">
              {LOCALES.filter((l) => l !== article.locale).map((l) => (
                <Field
                  key={l}
                  label={`Traduction ${localeMeta[l].label}`}
                  hint="Liée seulement si l’autre article pointe en retour."
                >
                  <select
                    value={article.translations[l] ?? ''}
                    onChange={(e) => {
                      const translations = { ...article.translations };
                      if (e.target.value) translations[l] = e.target.value;
                      else delete translations[l];
                      set('translations', translations);
                    }}
                  >
                    <option value="">Aucune</option>
                    {others
                      .filter((row) => row.locale === l)
                      .map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.title || row.id}
                        </option>
                      ))}
                  </select>
                </Field>
              ))}
            </div>
          </section>

          <section>
            <h2>Référencement</h2>
            <Field
              label="Titre SEO"
              error={fieldError('seo.title')}
              hint={`${article.seo.title.length} caractères — repère de lisibilité autour de 60, pas une garantie d’affichage.`}
            >
              <input
                value={article.seo.title}
                onChange={(e) => set('seo', { ...article.seo, title: e.target.value })}
              />
            </Field>
            <Field
              label="Description"
              error={fieldError('seo.description')}
              hint={`${article.seo.description.length} caractères — repère autour de 155.`}
            >
              <textarea
                rows={3}
                value={article.seo.description}
                onChange={(e) => set('seo', { ...article.seo, description: e.target.value })}
              />
            </Field>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={article.seo.noindex}
                onChange={(e) => set('seo', { ...article.seo, noindex: e.target.checked })}
              />
              Demander aux moteurs de ne pas indexer cet article (il reste public)
            </label>
            <h3>Image de partage (facultative, 1200 × 630 conseillé)</h3>
            <ImageField
              value={article.seo.image ?? { src: '', width: 0, height: 0, alt: '' }}
              onChange={(image) =>
                set('seo', { ...article.seo, image: image.src ? image : undefined })
              }
              optional
            />
          </section>
        </div>
      )}
    </main>
  );
}

/**
 * A labelled control. The label names the field and nothing else; the hint
 * and the error are attached with aria-describedby, so a screen reader
 * announces « Titre », then its guidance — not « Titre 12/140 » as a name.
 */
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactElement<Record<string, unknown>>;
}) {
  const id = useId();
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  const wire = (element: ReactElement<Record<string, unknown>>) =>
    cloneElement(element, {
      id,
      'aria-describedby': described || undefined,
      'aria-invalid': error ? true : undefined,
    });
  // A control may come wrapped (the slug field has a button beside it).
  const control =
    typeof children.type === 'string' && ['input', 'select', 'textarea'].includes(children.type)
      ? wire(children)
      : cloneElement(children, {
          children: Children.map(children.props.children as ReactNode, (child, i) =>
            i === 0 && isValidElement(child)
              ? wire(child as ReactElement<Record<string, unknown>>)
              : child,
          ),
        });
  return (
    <div className={`admin-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      {error && (
        <em id={`${id}-error`} className="admin-error">
          {error}
        </em>
      )}
    </div>
  );
}

function ImageField({
  value,
  onChange,
  error,
  optional = false,
}: {
  value: Article['cover'];
  onChange: (image: Article['cover']) => void;
  error?: string;
  optional?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [failure, setFailure] = useState('');
  return (
    <div className={`admin-image${error ? ' has-error' : ''}`}>
      {value.src && <img src={value.src} alt="" width={value.width} height={value.height} />}
      <div>
        <label className="admin-field">
          <span>
            {value.src ? 'Remplacer l’image' : 'Envoyer une image'} (PNG, JPEG ou WebP, 8 Mo max.)
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              setUploading(true);
              setFailure('');
              try {
                const media = await api.upload(file);
                onChange({ ...value, ...media });
              } catch (err) {
                setFailure((err as Error).message);
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        {uploading && <p role="status">Envoi…</p>}
        {failure && <p className="admin-error">{failure}</p>}
        {(value.src || !optional) && (
          <>
            <label className="admin-field">
              <span>Texte alternatif{optional ? '' : ' (obligatoire)'}</span>
              <input
                value={value.alt}
                onChange={(e) => onChange({ ...value, alt: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span>Légende (facultative)</span>
              <input
                value={value.caption ?? ''}
                onChange={(e) => onChange({ ...value, caption: e.target.value || undefined })}
              />
            </label>
          </>
        )}
        {optional && value.src && (
          <button type="button" onClick={() => onChange({ src: '', width: 0, height: 0, alt: '' })}>
            Retirer
          </button>
        )}
        {error && <p className="admin-error">{error}</p>}
      </div>
    </div>
  );
}
