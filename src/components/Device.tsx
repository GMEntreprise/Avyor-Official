import { useUi } from '../content/context';
export function Device({
  scene = '04-feed',
  priority = false,
  className = '',
}: {
  scene?: string;
  priority?: boolean;
  className?: string;
}) {
  const { screen } = useUi();
  return (
    <div className={`device ${className}`}>
      <img
        src={`/assets/screens/${scene}-396.webp`}
        srcSet={`/assets/screens/${scene}-396.webp 396w, /assets/screens/${scene}-660.webp 660w`}
        sizes="(max-width: 600px) 260px, 330px"
        width="396"
        height="860"
        alt={`${screen.prefix} : ${screen.scenes[scene] || screen.fallback}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
}
export function DemoCaption() {
  return <p className="demo-caption">{useUi().demoCaption}</p>;
}
