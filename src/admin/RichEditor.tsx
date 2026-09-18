import { useEffect, useRef } from 'react';
import {
  EditorContent,
  Extension,
  Node,
  mergeAttributes,
  useEditor,
  useEditorState,
  type Editor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { isSafeHref } from '../news/model';
import type { PMDoc } from '../news/types';
import { api } from './api';

/**
 * The article editor.
 *
 * Tiptap keeps the document as ProseMirror JSON — the format stored, previewed
 * and published — so formatting survives every round trip untouched. The
 * schema below is the whole vocabulary of an article: anything pasted from a
 * word processor that does not fit it (fonts, colours, classes, stray markup)
 * is dropped by the parser rather than stored.
 */

/** Section anchors, quote attributions and image captions, stored with the node. */
const Attributes = Extension.create({
  name: 'avyorAttributes',
  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          id: {
            default: null,
            parseHTML: (el) => el.getAttribute('id'),
            renderHTML: (attrs) => (attrs.id ? { id: attrs.id } : {}),
          },
        },
      },
      {
        types: ['blockquote'],
        attributes: {
          cite: {
            default: null,
            parseHTML: (el) => el.getAttribute('data-cite'),
            renderHTML: (attrs) => (attrs.cite ? { 'data-cite': attrs.cite } : {}),
          },
        },
      },
      {
        types: ['image'],
        attributes: {
          caption: {
            default: null,
            parseHTML: (el) => el.getAttribute('data-caption'),
            renderHTML: (attrs) => (attrs.caption ? { 'data-caption': attrs.caption } : {}),
          },
        },
      },
    ];
  },
});

/** Example, checklist or point of attention: a framed block of paragraphs and lists. */
const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: '(paragraph | bulletList | orderedList)+',
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: 'example',
        parseHTML: (el) => el.getAttribute('data-variant') ?? 'example',
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant }),
      },
    };
  },
  parseHTML: () => [{ tag: 'aside[data-callout]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'aside',
    mergeAttributes({ 'data-callout': '' }, HTMLAttributes),
    0,
  ],
});

/**
 * Adds, edits or removes the link on the selection.
 *
 * A browser dialog takes focus away from the editor, and the editor does not
 * notice it coming back: its own idea of the selection would stay on the
 * linked words while the visible caret moves on — and the next Enter would
 * replace them. So the selection is captured before the dialog, restored
 * after it, and the caret is left just after the link, focused for real.
 */
function editLink(editor: Editor) {
  const { from, to } = editor.state.selection;
  const current = editor.getAttributes('link').href as string | undefined;
  const value = window.prompt(
    'Adresse du lien (https://…, /page/ ou #section). Laissez vide pour retirer le lien.',
    current ?? '',
  );
  const back = () => {
    editor.view.focus();
    return editor.chain().focus().setTextSelection({ from, to });
  };
  if (value === null) return void back().run();
  if (!value.trim()) return void back().extendMarkRange('link').unsetLink().run();
  if (!isSafeHref(value.trim())) {
    window.alert('Adresse refusée : utilisez https://, une page du site (/…) ou une ancre (#…).');
    return void back().run();
  }
  back()
    .extendMarkRange('link')
    .setLink({ href: value.trim() })
    .setTextSelection(editor.state.selection.to)
    .run();
}

const Shortcuts = (onLink: () => void) =>
  Extension.create({
    name: 'avyorShortcuts',
    addKeyboardShortcuts() {
      return {
        'Mod-k': () => {
          // Opened after the key has been handled: a blocking dialog and a new
          // transaction inside the editor's own keydown are silently dropped.
          setTimeout(onLink, 0);
          return true;
        },
      };
    },
  });

export function RichEditor({
  value,
  version,
  onChange,
  error,
}: {
  value: PMDoc;
  /** Changes only when a version comes from the server: load, save, publish. */
  version: string;
  onChange: (doc: PMDoc) => void;
  error?: string;
}) {
  const editorRef = useRef<Editor | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          protocols: ['https', 'mailto'],
          isAllowedUri: (url) => isSafeHref(url),
          HTMLAttributes: { rel: null, target: null },
        },
      }),
      Image.configure({ allowBase64: false }),
      TableKit.configure({ table: { resizable: false } }),
      Callout,
      Attributes,
      Shortcuts(() => editorRef.current && editLink(editorRef.current)),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'article-body admin-editor-surface',
        'aria-label': 'Contenu de l’article',
      },
      // Word and some browsers add comments and style sheets to the clipboard;
      // the schema discards the rest of their markup on its own.
      transformPastedHTML: (html) =>
        html.replace(/<!--[\s\S]*?-->/g, '').replace(/<style[\s\S]*?<\/style>/gi, ''),
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON() as PMDoc),
    immediatelyRender: true,
  });
  editorRef.current = editor;

  // Only a version coming from the server replaces the content — the saved
  // document carries the section anchors the server assigned. Typing never
  // does: React state trails the editor by a render, and writing it back would
  // undo keystrokes under the cursor. The selection survives the swap.
  const latest = useRef(value);
  latest.current = value;
  useEffect(() => {
    if (!editor) return;
    const next = latest.current;
    if (JSON.stringify(editor.getJSON()) === JSON.stringify(next)) return;
    const { from, to } = editor.state.selection;
    editor.commands.setContent(next, { emitUpdate: false });
    const size = editor.state.doc.content.size;
    editor.commands.setTextSelection({ from: Math.min(from, size), to: Math.min(to, size) });
  }, [editor, version]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e && {
        paragraph: e.isActive('paragraph'),
        h2: e.isActive('heading', { level: 2 }),
        h3: e.isActive('heading', { level: 3 }),
        h4: e.isActive('heading', { level: 4 }),
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        link: e.isActive('link'),
        bullet: e.isActive('bulletList'),
        ordered: e.isActive('orderedList'),
        quote: e.isActive('blockquote'),
        table: e.isActive('table'),
        callout: e.isActive('callout'),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      },
  });

  if (!editor || !state) return null;
  const run = (fn: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => () =>
    fn(editor.chain().focus()).run();
  const button = (label: string, active: boolean, action: () => void, title = label) => (
    <button
      type="button"
      className="admin-tool"
      aria-pressed={active}
      aria-label={title}
      title={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={action}
    >
      {label}
    </button>
  );

  const insertImage = async (file: File) => {
    const alt = window.prompt('Texte alternatif (obligatoire) : que montre l’image ?', '');
    if (!alt?.trim()) return;
    const caption = window.prompt('Légende (facultative) :', '') ?? '';
    try {
      const media = await api.upload(file);
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'image',
          attrs: { ...media, alt: alt.trim(), caption: caption.trim() || null },
        })
        .run();
    } catch (failure) {
      window.alert((failure as Error).message);
    }
  };

  return (
    <div className={`admin-editor${error ? ' has-error' : ''}`}>
      <div className="admin-toolbar" role="toolbar" aria-label="Mise en forme">
        {button(
          '¶',
          state.paragraph,
          run((c) => c.setParagraph()),
          'Paragraphe',
        )}
        {button(
          'H2',
          state.h2,
          run((c) => c.toggleHeading({ level: 2 })),
          'Titre de section (H2)',
        )}
        {button(
          'H3',
          state.h3,
          run((c) => c.toggleHeading({ level: 3 })),
          'Sous-titre (H3)',
        )}
        {button(
          'H4',
          state.h4,
          run((c) => c.toggleHeading({ level: 4 })),
          'Intertitre (H4)',
        )}
        <span className="admin-tool-sep" />
        {button(
          'G',
          state.bold,
          run((c) => c.toggleBold()),
          'Gras (Ctrl/Cmd + B)',
        )}
        {button(
          'I',
          state.italic,
          run((c) => c.toggleItalic()),
          'Italique (Ctrl/Cmd + I)',
        )}
        {button(
          'Lien',
          state.link,
          () => editLink(editor),
          'Ajouter, modifier ou retirer un lien (Ctrl/Cmd + K)',
        )}
        {button(
          'Effacer',
          false,
          run((c) => c.unsetAllMarks().clearNodes()),
          'Supprimer la mise en forme',
        )}
        <span className="admin-tool-sep" />
        {button(
          '• Liste',
          state.bullet,
          run((c) => c.toggleBulletList()),
          'Liste à puces',
        )}
        {button(
          '1. Liste',
          state.ordered,
          run((c) => c.toggleOrderedList()),
          'Liste numérotée',
        )}
        {button(
          'Citation',
          state.quote,
          run((c) => c.toggleBlockquote()),
          'Citation',
        )}
        {state.quote &&
          button('Attribution', false, () => {
            const cite = window.prompt(
              'Qui parle ? Uniquement une attribution réelle et vérifiable. Vide pour retirer.',
              (editor.getAttributes('blockquote').cite as string) ?? '',
            );
            if (cite !== null)
              editor
                .chain()
                .focus()
                .updateAttributes('blockquote', { cite: cite.trim() || null })
                .run();
          })}
        <span className="admin-tool-sep" />
        {button('Image', false, () => fileInput.current?.click(), 'Insérer une image')}
        {button(
          'Tableau',
          state.table,
          run((c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true })),
          'Insérer un tableau',
        )}
        {state.table && (
          <>
            {button(
              '+ ligne',
              false,
              run((c) => c.addRowAfter()),
            )}
            {button(
              '+ colonne',
              false,
              run((c) => c.addColumnAfter()),
            )}
            {button(
              '− ligne',
              false,
              run((c) => c.deleteRow()),
            )}
            {button(
              '− colonne',
              false,
              run((c) => c.deleteColumn()),
            )}
            {button(
              'Supprimer le tableau',
              false,
              run((c) => c.deleteTable()),
            )}
          </>
        )}
        <label className="admin-tool admin-tool-select">
          <span className="sr-only">Encadré</span>
          <select
            value=""
            onChange={(event) => {
              const variant = event.target.value;
              if (variant === 'lift') editor.chain().focus().lift('callout').run();
              else if (variant) editor.chain().focus().wrapIn('callout', { variant }).run();
            }}
          >
            <option value="">Encadré…</option>
            <option value="example">Exemple</option>
            <option value="checklist">Liste à vérifier</option>
            <option value="warning">Point d’attention</option>
            {state.callout && <option value="lift">Retirer l’encadré</option>}
          </select>
        </label>
        {button(
          '—',
          false,
          run((c) => c.setHorizontalRule()),
          'Séparateur',
        )}
        <span className="admin-tool-sep" />
        {button(
          '↶',
          false,
          run((c) => c.undo()),
          'Annuler (Ctrl/Cmd + Z)',
        )}
        {button(
          '↷',
          false,
          run((c) => c.redo()),
          'Rétablir (Ctrl/Cmd + Maj + Z)',
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void insertImage(file);
          }}
        />
      </div>
      <EditorContent editor={editor} />
      {error && <p className="admin-error">{error}</p>}
    </div>
  );
}
