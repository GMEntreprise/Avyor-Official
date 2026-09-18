import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { navigation } from '../content/site';
import { DownloadAppButton } from './DownloadAppButton';
import logo from '../assets/brand/logo.webp';
import { ordinal } from '../lib/utils';
export function Brand() {
  return (
    <a className="brand" href="/" aria-label="AVYOR, accueil">
      <img src={logo} width="44" height="44" alt="" />
      <span>
        avyor<span className="brand-period">.</span>
      </span>
    </a>
  );
}
export function Navbar({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
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
        <nav aria-label="Navigation principale" className="desktop-nav">
          {navigation.map(([label, href]) => (
            <a key={href} href={href} aria-current={path === href ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <DownloadAppButton variant="nav" size="sm" className="nav-download" />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="menu-button" aria-label="Ouvrir le menu">
              <Menu aria-hidden="true" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="menu-overlay" />
            <Dialog.Content className="menu-panel">
              <Dialog.Title className="sr-only">Menu AVYOR</Dialog.Title>
              <Dialog.Description className="sr-only">
                Découvrez le produit et choisissez votre parcours.
              </Dialog.Description>
              <div className="menu-heading">
                <Brand />
                <Dialog.Close asChild>
                  <button className="icon-button" aria-label="Fermer le menu">
                    <X aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>
              <nav aria-label="Navigation mobile">
                {navigation.map(([label, href], i) => (
                  <a key={href} href={href} onClick={() => setOpen(false)}>
                    <small>{ordinal(i)}</small>
                    {label}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ))}
              </nav>
              <DownloadAppButton variant="primary" size="lg" className="menu-download" />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>
    </>
  );
}
