import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { LOCALES, localeMeta, swapLocale, type Locale } from '../i18n/locales';
import { useSite } from '../content/context';
// Illustrations only: drawn in components/Icons3D.tsx, exported as files by
// scripts/build-icons.tsx, so the drawings never travel in the bundle.
import flagFr from '../assets/icons/flag-fr.svg';
import flagEn from '../assets/icons/flag-en.svg';
import flagEs from '../assets/icons/flag-es.svg';
import flagHe from '../assets/icons/flag-he.svg';
import flagAr from '../assets/icons/flag-ar.svg';

const flags: Record<Locale, string> = {
  fr: flagFr,
  en: flagEn,
  es: flagEs,
  he: flagHe,
  ar: flagAr,
};

/**
 * The language switcher.
 *
 * The site has no client router: every page is a separate prerendered
 * document, so choosing a language is a real navigation to that language's
 * URL — the visitor lands on the same page, written in the language they
 * asked for. The current page fades out first, so the switch reads as one
 * movement rather than a reload; a visitor who asked for less motion gets the
 * navigation on its own.
 *
 * The menu is built here rather than pulled from a component library: it
 * needs five items, a checked state and keyboard handling, and the site's
 * JavaScript budget is better spent elsewhere. The markup keeps the
 * `data-state` attributes a menu primitive would expose, so the animation is
 * written once in CSS and does not depend on how the menu is implemented.
 */
export function LanguageSelector({
  className = '',
  onOpenChange,
}: {
  className?: string;
  /** Lets a surrounding layer know that a menu is open above it. */
  onOpenChange?: (open: boolean) => void;
}) {
  const { locale, content } = useSite();
  const labels = content.ui.language;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Locale | null>(null);
  const [closing, setClosing] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  // Closing is animated, so the node has to outlive the click that dismissed
  // it. `closing` keeps it mounted for the length of the exit animation.
  const openMenu = () => {
    setOpen(true);
    onOpenChange?.(true);
  };
  const close = useCallback(
    (focusTrigger = true) => {
      setOpen(false);
      onOpenChange?.(false);
      setClosing(true);
      if (focusTrigger) trigger.current?.focus();
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close(false);
    };
    // Capture phase: inside the mobile menu, a dialog is also listening for
    // Escape. The innermost layer is the one that should close, so this
    // handler runs first and keeps the key to itself.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) items.current[LOCALES.indexOf(locale)]?.focus();
  }, [open, locale]);

  const move = (from: number, step: number) => {
    const next = (from + step + LOCALES.length) % LOCALES.length;
    items.current[next]?.focus();
  };

  const select = (target: Locale) => {
    if (target === locale) return close();
    setPending(target);
    const url = swapLocale(window.location.pathname, target) + window.location.hash;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.assign(url);
      return;
    }
    // The fade is an invitation, never a gate: whatever happens to the
    // transition, the navigation leaves within the safety delay.
    let left = false;
    const go = () => {
      if (left) return;
      left = true;
      window.location.assign(url);
    };
    document.documentElement.classList.add('language-switching');
    document.documentElement.addEventListener('transitionend', go, { once: true });
    window.setTimeout(go, 260);
  };

  return (
    <div className={`language-selector ${className}`} ref={root}>
      <button
        type="button"
        ref={trigger}
        className="language-trigger"
        data-state={open ? 'open' : 'closed'}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${labels.label} : ${localeMeta[locale].label}`}
        aria-busy={pending !== null}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            openMenu();
          }
        }}
      >
        <img
          className="language-flag"
          src={flags[locale]}
          width="24"
          height="16"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="language-code">{localeMeta[locale].code}</span>
        <ChevronDown className="language-chevron" aria-hidden="true" />
      </button>
      {(open || closing) && (
        <div
          id={menuId}
          role="menu"
          aria-label={labels.label}
          className="language-menu"
          data-state={open ? 'open' : 'closed'}
          onAnimationEnd={() => !open && setClosing(false)}
        >
          {LOCALES.map((target, index) => {
            const meta = localeMeta[target];
            return (
              <button
                key={target}
                type="button"
                role="menuitemradio"
                aria-checked={target === locale}
                ref={(node) => {
                  items.current[index] = node;
                }}
                className="language-menu-option"
                data-state={target === locale ? 'checked' : 'unchecked'}
                disabled={pending !== null}
                onClick={() => select(target)}
                onKeyDown={(event) => {
                  const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
                  if (step !== undefined) {
                    event.preventDefault();
                    move(index, step);
                  } else if (event.key === 'Home' || event.key === 'End') {
                    event.preventDefault();
                    move(event.key === 'Home' ? 0 : -1, 0);
                  }
                }}
              >
                <img
                  className="language-flag"
                  src={flags[target]}
                  width="24"
                  height="16"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                {/* Le nom de la langue est écrit dans sa propre écriture, mais
                    la rangée garde le sens de lecture de la page : isolé, le
                    mot hébreu ou arabe se compose correctement sans entraîner
                    la ligne avec lui. */}
                <span lang={meta.tag}>{meta.label}</span>
                <span className="language-check">
                  {target === locale && <Check size={16} aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
