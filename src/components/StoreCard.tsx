import { useUi } from '../content/context';
import { track } from '../lib/track';
import type { StorePlatform, StoreTarget } from '../lib/app-download';

/**
 * The platform marks, drawn rather than fetched.
 *
 * They are two paths of a few hundred bytes each and they must take the
 * colour of the button around them, so they stay in the markup instead of
 * becoming files like the illustrations do.
 */
function StoreMark({ platform }: { platform: StorePlatform }) {
  return platform === 'ios' ? (
    <svg className="store-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M17.05 12.54c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.61-1.7-3.18-1.73-1.35-.14-2.64.79-3.32.79-.69 0-1.74-.77-2.86-.75-1.47.02-2.83.86-3.58 2.17-1.53 2.65-.39 6.57 1.1 8.72.73 1.05 1.6 2.23 2.74 2.19 1.1-.04 1.51-.71 2.84-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.33-3.47ZM14.86 5.6c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.55 1.31-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.57-1.22Z"
      />
    </svg>
  ) : (
    <svg className="store-mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M6 3.4 19.4 12 6 20.6Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * One button per platform, two states, one component.
 *
 * A platform without a verified store URL never becomes a link: it stays a
 * plain element, so there is nothing to click and no placeholder href to leak
 * into the build. In that state the button says so where it would otherwise
 * say what the visitor is about to do.
 */
export function StoreCard({ store }: { store: StoreTarget }) {
  const ui = useUi().store;
  const labels = store.platform === 'ios' ? ui.apple : ui.google;
  const available = store.status === 'available';
  const className = `store-card store-card-${store.platform} ${available ? 'is-available' : 'is-pending'}`;
  const inner = (
    <>
      <StoreMark platform={store.platform} />
      <span className="store-label">
        <small>{available ? labels.lead : ui.comingSoon}</small>
        <strong>{labels.name}</strong>
      </span>
    </>
  );
  if (available)
    return (
      <a href={store.url} className={className} onClick={() => track(store.event)}>
        {inner}
      </a>
    );
  return <div className={className}>{inner}</div>;
}
