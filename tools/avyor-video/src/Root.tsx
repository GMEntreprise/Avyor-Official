import { Composition, Folder, Still } from 'remotion';
import { AvyorHeroDesktop } from './compositions/AvyorHeroDesktop';
import { AvyorHeroMobile } from './compositions/AvyorHeroMobile';
import { AvyorHeroPoster } from './compositions/AvyorHeroPoster';
import { FPS, DURATION } from './config/timing';
import { FORMATS } from './config/assets';
export const RemotionRoot = () => <>
  <Folder name="Production-desktop">
    <Composition id="AvyorHeroDesktop" component={AvyorHeroDesktop} defaultProps={{ production: true }} {...FORMATS.desktop} fps={FPS} durationInFrames={DURATION} />
  </Folder>
  <Folder name="Animatics-stills">
    <Composition id="AvyorAnimaticDesktop" component={AvyorHeroDesktop} {...FORMATS.desktop} fps={FPS} durationInFrames={DURATION} />
    {/* Mobile has no portrait rush yet, so it stays an animatic on purpose. */}
    <Composition id="AvyorAnimaticMobile" component={AvyorHeroMobile} {...FORMATS.mobile} fps={FPS} durationInFrames={DURATION} />
  </Folder>
  <Folder name="Posters-reduced-motion">
    {/* Desktop's poster is cut from the film by scripts/render.ts. */}
    <Still id="AvyorHeroPosterMobile" component={AvyorHeroPoster} {...FORMATS.mobile} />
  </Folder>
</>;
