import type { Format, ShotAsset } from '../config/assets';
import { SCENES } from '../config/timing';

/**
 * A format is only exportable when every beat of the cut has a rush that is
 * long enough for the frames it must fill, and when every beat that shows an
 * AVYOR screen carries tracking covering exactly those frames.
 */
export function validateProduction(assets: ShotAsset[], format: Format, exists: (file: string) => boolean): string[] {
  const errors: string[] = [];
  assets.forEach((shot, index) => {
    const cut = SCENES[index];
    if (!cut) { errors.push(shot.id + ': no place in the cut'); return; }
    const footage = shot[format].footage;
    if (!footage || !exists(footage.file)) { errors.push(shot.id + ': missing footage (' + format + ')'); return; }
    if (!footage.reviewed || !/^[a-f0-9]{64}$/.test(footage.sha256)) errors.push(shot.id + ': footage review/hash required');
    const needed = cut.trimBefore + cut.duration;
    if (!(footage.frames >= needed)) errors.push(shot.id + ': rush holds ' + footage.frames + ' frames, the cut needs ' + needed);
    if (!shot.ui) return;
    const track = footage.screenTrack;
    const first = cut.trimBefore, last = cut.trimBefore + cut.duration - 1;
    if (!track || track.length < 2 || track[0].frame > first || track[track.length - 1].frame < last) {
      errors.push(shot.id + ': screen tracking must cover frames ' + first + '–' + last);
      return;
    }
    track.forEach((k, i) => {
      if (!Number.isInteger(k.frame) || (i > 0 && k.frame <= track[i - 1].frame) ||
        k.corners.length !== 4 || k.corners.some((p) => p.length !== 2 || p.some((v) => !Number.isFinite(v) || v < 0 || v > 1))) {
        errors.push(shot.id + ': invalid normalized tracking coordinates');
      }
    });
  });
  return errors;
}
