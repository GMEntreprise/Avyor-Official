import { ArrowUpRight } from 'lucide-react';
import { stores, anyStoreAvailable } from '../config';
import { StoreCard } from './StoreCard';
export function StoreButtons() {
  return (
    <div className="store-area">
      <div className="store-buttons">
        {stores.map((store) => (
          <StoreCard key={store.platform} store={store} />
        ))}
      </div>
      {!anyStoreAvailable && (
        <p className="store-note">
          Le lancement se prépare.{' '}
          <a href="/contact/">
            Parlons de votre projet <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </p>
      )}
    </div>
  );
}
