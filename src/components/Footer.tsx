import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from './Navbar';
import { StoreButtons } from './StoreButtons';
import { Device } from './Device';
export function Footer() {
  const word = useRef<SVGSVGElement>(null);
  return (
    <footer>
      <section className="final-cta container">
        <div>
          <p className="eyebrow">LE PROCHAIN PROJET COMMENCE PAR UNE RENCONTRE</p>
          <h2>
            Et si c’était
            <br />
            <span>la bonne ?</span>
          </h2>
          <StoreButtons />
          <a className="text-link" href="/download/">
            Retrouver AVYOR <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-device">
          <Device scene="08-portfolio" />
        </div>
      </section>
      <div className="footer-main container">
        <div className="footer-brand">
          <Brand />
          <p>La création fait la rencontre.</p>
        </div>
        <nav aria-label="Liens du pied de page">
          <div>
            <span>Explorer</span>
            <a href="/features/">Le produit</a>
            <a href="/creators/">Pour les Creators</a>
            <a href="/brands/">Pour les marques</a>
            <a href="/how-it-works/">Comment ça marche</a>
          </div>
          <div>
            <span>Échanger</span>
            <a href="/security/">Sécurité & paiements</a>
            <a href="/faq/">Questions fréquentes</a>
            <a href="/contact/">Contact</a>
            <a href="/download/">Télécharger</a>
          </div>
          <div>
            <span>Les règles</span>
            <a href="/privacy/">Confidentialité</a>
            <a href="/terms/">Conditions d’utilisation</a>
            <a href="/legal/">Mentions légales</a>
          </div>
        </nav>
      </div>
      <div
        className="footer-signature container"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          word.current
            ?.querySelector('radialGradient')
            ?.setAttribute('cx', `${((e.clientX - r.left) / r.width) * 100}%`);
        }}
      >
        <svg ref={word} viewBox="0 0 1200 265" aria-hidden="true">
          <defs>
            <radialGradient id="footer-glow">
              <stop offset="0" stopColor="#A78BFA" />
              <stop offset="1" stopColor="#30364a" />
            </radialGradient>
          </defs>
          <text x="600" y="232" textAnchor="middle">
            AVYOR
          </text>
        </svg>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} AVYOR · Un produit Shavod.</span>
        <span>Creators × Marques</span>
        <a href="/#top">Retour en haut ↑</a>
      </div>
    </footer>
  );
}
