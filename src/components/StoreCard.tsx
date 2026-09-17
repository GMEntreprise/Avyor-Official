import { track } from '../lib/track';
import type { StoreTarget } from '../lib/app-download';

/**
 * One card per platform, two states, one component.
 *
 * The official Apple and Google badge artwork is rendered unmodified in both
 * states — only the AVYOR container around it changes. A platform without a
 * verified store URL never becomes a link: it stays a plain element, so there
 * is nothing to click and no placeholder href to leak into the build.
 */
export function StoreCard({ store }: { store: StoreTarget }) {
  const badge = (
    <img
      src={store.badge.src}
      width={store.badge.width}
      height={store.badge.height}
      alt={store.status === 'available' ? store.badge.alt : store.store}
      className="store-badge"
    />
  );
  if (store.status === 'available')
    return (
      <a href={store.url} className="store-card is-available" onClick={() => track(store.event)}>
        {badge}
      </a>
    );
  return (
    <div className="store-card is-pending">
      {badge}
      <span className="store-card-status">
        <span className="store-card-os">{store.os}</span>
        Bientôt disponible
      </span>
    </div>
  );
}
