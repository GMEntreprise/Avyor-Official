import type { ReactNode } from 'react';
import { headingAnchors, isSafeHref, plainText } from './model';
import type { Mark, PMDoc, PMNode } from './types';

/**
 * The article body, rendered from its structured document.
 *
 * Every node type is listed here; anything else renders nothing. Nothing is
 * ever injected as HTML, so there is no markup an author could slip in: text
 * stays text, and a link is drawn only when its address passes the same check
 * the editor and the build apply.
 *
 * Headings take their anchors from `headingAnchors`, the very function the
 * table of contents uses — the preview in the admin and the public page render
 * through this component, so a section has one address everywhere.
 */
export interface BodyLabels {
  sectionLink: string;
  callouts: Record<'example' | 'checklist' | 'warning', string>;
  tableLabel?: string;
}

function withMarks(text: ReactNode, marks: Mark[] = [], key: number): ReactNode {
  let node = text;
  // Emphasis inside, link outside: <a><strong>…</strong></a>.
  if (marks.some((m) => m.type === 'italic')) node = <em>{node}</em>;
  if (marks.some((m) => m.type === 'bold')) node = <strong>{node}</strong>;
  const link = marks.find((m) => m.type === 'link');
  if (link && isSafeHref(link.attrs?.href)) {
    const href = String(link.attrs?.href);
    const external = /^https:/.test(href);
    node = (
      <a href={href} {...(external ? { rel: 'noopener' } : {})}>
        {node}
      </a>
    );
  }
  return <span key={key}>{node}</span>;
}

function inline(nodes: PMNode[] = []): ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === 'hardBreak') return <br key={i} />;
    if (node.type !== 'text') return null;
    return node.marks?.length ? withMarks(node.text, node.marks, i) : (node.text ?? null);
  });
}

function block(node: PMNode, key: number, labels: BodyLabels): ReactNode {
  const children = () => (node.content ?? []).map((child, i) => block(child, i, labels));
  switch (node.type) {
    case 'paragraph':
      return node.content?.length ? <p key={key}>{inline(node.content)}</p> : null;
    case 'bulletList':
      return <ul key={key}>{children()}</ul>;
    case 'orderedList':
      return (
        <ol key={key} start={Number(node.attrs?.start) > 1 ? Number(node.attrs?.start) : undefined}>
          {children()}
        </ol>
      );
    case 'listItem':
      return <li key={key}>{children()}</li>;
    case 'blockquote': {
      const cite = typeof node.attrs?.cite === 'string' ? node.attrs.cite.trim() : '';
      const quote = <blockquote key={key}>{children()}</blockquote>;
      // An attribution is shown only when the author gave a real one.
      return cite ? (
        <figure key={key} className="article-quote">
          {quote}
          <figcaption>— {cite}</figcaption>
        </figure>
      ) : (
        quote
      );
    }
    case 'image':
      return (
        <figure key={key} className="article-figure">
          <img
            src={String(node.attrs?.src)}
            alt={String(node.attrs?.alt ?? '')}
            width={Number(node.attrs?.width) || undefined}
            height={Number(node.attrs?.height) || undefined}
            loading="lazy"
            decoding="async"
          />
          {typeof node.attrs?.caption === 'string' && node.attrs.caption.trim() && (
            <figcaption>{node.attrs.caption}</figcaption>
          )}
        </figure>
      );
    case 'table': {
      const rows = node.content ?? [];
      return (
        // Wide tables scroll inside their own frame, never the whole page.
        <div
          key={key}
          className="article-table"
          role="region"
          aria-label={labels.tableLabel}
          tabIndex={0}
        >
          <table>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {(row.content ?? []).map((cell, c) =>
                    cell.type === 'tableHeader' ? (
                      <th key={c} scope={r === 0 ? 'col' : 'row'}>
                        {(cell.content ?? []).map((child, i) => block(child, i, labels))}
                      </th>
                    ) : (
                      <td key={c}>
                        {(cell.content ?? []).map((child, i) => block(child, i, labels))}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'callout': {
      const variant = String(node.attrs?.variant) as keyof BodyLabels['callouts'];
      if (!labels.callouts[variant]) return null;
      return (
        <aside key={key} className={`callout callout-${variant}`}>
          <p className="callout-label">{labels.callouts[variant]}</p>
          {children()}
        </aside>
      );
    }
    case 'horizontalRule':
      return <hr key={key} />;
    default:
      return null;
  }
}

export function ArticleBody({ doc, labels }: { doc: PMDoc; labels: BodyLabels }) {
  const anchors = headingAnchors(doc);
  let heading = 0;
  return (
    <div className="article-body">
      {doc.content.map((node, i) => {
        if (node.type !== 'heading') return block(node, i, labels);
        const id = anchors[heading++];
        const level = Math.min(4, Math.max(2, Number(node.attrs?.level) || 2));
        const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
        return (
          <div key={i} className={`article-heading article-heading-${level}`}>
            {/* Focusable by script only: the table of contents moves focus here. */}
            <Tag id={id} tabIndex={-1}>
              {inline(node.content)}
            </Tag>
            <a
              className="heading-anchor"
              href={`#${id}`}
              aria-label={`${labels.sectionLink} : ${plainText(node)}`}
            >
              #
            </a>
          </div>
        );
      })}
    </div>
  );
}
