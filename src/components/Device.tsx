export function Device({
  scene = '04-feed',
  priority = false,
  className = '',
}: {
  scene?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`device ${className}`}>
      <img
        src={`/assets/screens/${scene}-396.webp`}
        srcSet={`/assets/screens/${scene}-396.webp 396w, /assets/screens/${scene}-660.webp 660w`}
        sizes="(max-width: 600px) 260px, 330px"
        width="396"
        height="860"
        alt={`Écran AVYOR : ${{ '04-feed': 'feed vidéo', '02-matching': 'découverte des Creators', '03-match-detail': 'compatibilité avec une campagne', '05-campaign': 'brief de campagne', '06-collaboration': 'conversation de collaboration', '07-payment': 'suivi du paiement', '08-portfolio': 'portfolio Creator' }[scene] || 'application'}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
}
export function DemoCaption() {
  return (
    <p className="demo-caption">
      Écrans AVYOR · Données de démonstration. Profils, montants et statistiques illustratifs.
    </p>
  );
}
