import { ArrowUpRight } from 'lucide-react';
import { stores, anyStoreAvailable } from '../config';
import { useHref, useUi } from '../content/context';
import { StoreCard } from './StoreCard';
export function StoreButtons() {
  const ui = useUi().store;
  const href = useHref();
  return (
    <div className="store-area">
      <div className="store-buttons">
        {stores.map((store) => (
          <StoreCard key={store.platform} store={store} />
        ))}
      </div>
      {!anyStoreAvailable && (
        <p className="store-note">
          {ui.launching}{' '}
          <a href={href('contact')}>
            {ui.talk} <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </p>
      )}
    </div>
  );
}
