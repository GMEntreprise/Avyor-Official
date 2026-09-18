import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useHref, useSite } from '../content/context';
import { DownloadAppButton } from './DownloadAppButton';
import { LanguageSelector } from './LanguageSelector';
import { StoreButtons } from './StoreButtons';
import logo from '../assets/brand/logo.webp';
import { ordinal } from '../lib/utils';
export function Brand() {
  const { content } = useSite();
  const href = useHref();
  return (
    <a className="brand" href={href('')} aria-label={content.ui.brandHome}>
      <img src={logo} width="44" height="44" alt="" />
      {/* Le nom de la marque s'écrit de gauche à droite dans toutes les
          langues : sans cela, le point passe devant le mot en écriture
          arabe ou hébraïque. */}
      <span dir="ltr">
        avyor<span className="brand-period">.</span>
      </span>
    </a>
  );
}
export function Navbar({ path }: { path: string }) {
  const { content } = useSite();
  const ui = content.ui;
  const href = useHref();
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const o = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting));
    o.observe(node);
    return () => o.disconnect();
  }, []);
  return (
    <>
      <div className="nav-sentinel" ref={sentinel} />
      <header className={`navbar ${compact ? 'compact' : ''}`}>
        <Brand />
        <nav aria-label={ui.nav.main} className="desktop-nav">
          {content.navigation.map(([label, slug]) => (
            <a key={slug} href={href(slug)} aria-current={path === href(slug) ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <LanguageSelector className="nav-language" />
        <DownloadAppButton variant="nav" size="sm" className="nav-download" />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="menu-button" aria-label={ui.nav.open}>
              <Menu aria-hidden="true" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="menu-overlay" />
            <Dialog.Content
              className="menu-panel"
              // Escape closes the innermost layer first: the language menu if
              // it is open, this panel only once it is not.
              onEscapeKeyDown={(event) => languageOpen && event.preventDefault()}
            >
              <Dialog.Title className="sr-only">{ui.nav.menuTitle}</Dialog.Title>
              <Dialog.Description className="sr-only">{ui.nav.menuDescription}</Dialog.Description>
              <div className="menu-heading">
                <Brand />
                <Dialog.Close asChild>
                  <button className="icon-button" aria-label={ui.nav.close}>
                    <X aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>
              <nav aria-label={ui.nav.mobile}>
                {content.navigation.map(([label, slug], i) => (
                  <a key={slug} href={href(slug)} onClick={() => setOpen(false)}>
                    <small>{ordinal(i)}</small>
                    {label}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ))}
              </nav>
              <LanguageSelector className="menu-language" onOpenChange={setLanguageOpen} />
              {/* Le menu mobile porte les deux plateformes plutôt qu'un seul
                  appel générique : le sélecteur de langue tient déjà la place
                  du bouton unique dans la barre. */}
              <StoreButtons />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
    </>
  );
}
