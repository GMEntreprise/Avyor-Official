import selected from '../../production.json';
import type { Quad, Track } from '../lib/screen-transform';
export type Format = 'desktop' | 'mobile';
export type Footage = {
  file: string; sha256: string; reviewed: boolean; frames: number;
  screenTrack?: Track;
  /** Where the generated wall wordmark sits, and which band of it to defocus. */
  wallTrack?: Track;
  wallBand?: readonly [number, number];
};
export const FORMATS = { desktop: { width: 1920, height: 1080 }, mobile: { width: 1080, height: 1920 } } as const;
export const NATIVE = { desktop: { width: 1672, height: 941 }, mobile: { width: 941, height: 1672 } } as const;

/**
 * The three beats of the cut, and the still that stands in for each one while
 * a format has no footage. The real AVYOR screens are composited onto the two
 * shots where the phone actually faces the camera.
 */
const shots = [
  { id: 'shot-02', beat: 'recording', still: 'shot-02-recording.png' },
  { id: 'shot-03', beat: 'discovery', still: 'shot-03-brand-discovery.png', ui: 'ui/discover.png' },
  {
    id: 'shot-04', beat: 'collaboration', still: 'shot-04-collaboration.png',
    ui: 'ui/campaign.png', nextUi: 'ui/collaboration.png',
  },
] as const;

// Measured on the source stills. These are STILL corners, never used for footage.
const desktopScreens: Record<number, Quad> = {
  1: [[1094, 169], [1334, 160], [1320, 696], [1060, 684]],
  2: [[1311, 318], [1399, 321], [1396, 524], [1308, 523]],
};
const mobileScreens: Record<number, Quad> = {
  1: [[352, 666], [614, 668], [598, 1223], [325, 1217]],
  2: [[650, 899], [746, 904], [740, 1123], [637, 1118]],
};

export type ShotAsset = {
  id: string; beat: string; ui?: string; nextUi?: string;
  desktop: { image: string; footage: Footage | null; screen?: Quad };
  mobile: { image: string; footage: Footage | null; screen?: Quad };
};

export const ASSETS: ShotAsset[] = shots.map((shot, index) => ({
  id: shot.id,
  beat: shot.beat,
  ...('ui' in shot ? { ui: shot.ui } : {}),
  ...('nextUi' in shot ? { nextUi: shot.nextUi } : {}),
  desktop: {
    image: 'images/' + shot.still,
    footage: selected.desktop[index] as unknown as Footage | null,
    screen: desktopScreens[index],
  },
  mobile: {
    image: 'images/mobile/' + shot.still,
    footage: selected.mobile[index] as unknown as Footage | null,
    screen: mobileScreens[index],
  },
}));
