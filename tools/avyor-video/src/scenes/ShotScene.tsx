import { AbsoluteFill, Img, OffthreadVideo, staticFile } from 'remotion';
import { ASSETS, NATIVE, type Format } from '../config/assets';
import { SCENES } from '../config/timing';
import { sampleTrack, type Quad } from '../lib/screen-transform';
import { PhoneScreen } from '../components/PhoneScreen';
import { WallPatch } from '../components/WallPatch';
export function ShotScene({ index, frame, format, production, width, height }: { index: number; frame: number; format: Format; production: boolean; width: number; height: number }) {
  const shot = ASSETS[index], media = shot[format], native = NATIVE[format], cut = SCENES[index];
  const videoTrim = cut.trimBefore;
  const scale = production ? 1 : 1 + Math.max(0, Math.min(1, frame / (cut.duration - 1))) * 0.018;
  const origin = format === 'desktop' ? '74% 52%' : '55% 60%';
  let corners: Quad | undefined;
  if (shot.ui) {
    if (production) {
      if (!media.footage?.screenTrack) throw new Error(shot.id + ': missing Runway screen tracking');
      // The track is indexed on the clip, the scene on the cut: shift by the trim.
      const q = sampleTrack(media.footage.screenTrack, frame + cut.trimBefore);
      corners = q.map(([x, y]) => [x * width, y * height]) as unknown as Quad;
    } else if (media.screen) corners = media.screen.map(([x, y]) => [x / native.width * width, y / native.height * height]) as unknown as Quad;
  }
  const wall = production && media.footage?.wallTrack && media.footage.wallBand
    ? {
        band: media.footage.wallBand,
        corners: sampleTrack(media.footage.wallTrack, frame + cut.trimBefore).map(
          ([x, y]) => [x * width, y * height] as const,
        ) as unknown as Quad,
      }
    : null;
  const nextOpacity = shot.nextUi ? Math.max(0, Math.min(1, (frame - (cut.duration - 26)) / 8)) : 0;
  return <AbsoluteFill style={{ transform: 'scale(' + scale + ')', transformOrigin: origin }}>
    {production
      ? media.footage ? <OffthreadVideo src={staticFile(media.footage.file)} trimBefore={videoTrim} muted style={{ width, height, objectFit: 'fill' }} /> : (() => { throw new Error(shot.id + ': missing footage'); })()
      : <Img src={staticFile(media.image)} style={{ width, height, objectFit: 'fill' }} />}
    {wall && media.footage && (
      <WallPatch
        src={media.footage.file}
        trimBefore={videoTrim}
        corners={wall.corners}
        band={wall.band}
        width={width}
        height={height}
      />
    )}
    {corners && shot.ui && <PhoneScreen src={shot.ui} corners={corners} />}
    {corners && shot.nextUi && <PhoneScreen src={shot.nextUi} corners={corners} opacity={nextOpacity} />}
  </AbsoluteFill>;
}
