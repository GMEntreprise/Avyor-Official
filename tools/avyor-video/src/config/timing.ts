export const FPS = 24;
export const TRANSITION_FRAMES = 6;
export const LOOP_FRAMES = 8;

/**
 * The desktop cut, single source of truth for the film.
 *
 * Three beats, built from the three landscape rushes actually delivered:
 * the Creator shoots, the work is discovered, the collaboration starts.
 * `duration` is what each clip really holds minus a safety trim, so no
 * generation artefact from the first frames reaches the film. Nothing here
 * is padded to a round number the footage cannot honour.
 */
export const CUT = [
  { name: 'recording', trimBefore: 2, duration: 70 },
  { name: 'discovery', trimBefore: 1, duration: 47 },
  { name: 'collaboration', trimBefore: 2, duration: 70 },
] as const;

export const SCENES = CUT.map((shot, index) => ({
  ...shot,
  index,
  from: CUT.slice(0, index).reduce((total, s) => total + s.duration - TRANSITION_FRAMES, 0),
}));

export const DURATION = SCENES[SCENES.length - 1].from + SCENES[SCENES.length - 1].duration;

/** A scene fades in over the one before it; the first is simply there. */
export const sceneOpacity = (localFrame: number, index: number) =>
  index === 0 ? 1 : Math.max(0, Math.min(1, localFrame / (TRANSITION_FRAMES - 1)));

/**
 * The frame the poster freezes, chosen for what it has to carry alone:
 * the Creator present, the phone showing a real AVYOR screen, and the left of
 * the image quiet enough for the headline that sits over it.
 */
export const POSTER = {
  /**
   * Desktop freezes a frame of the film itself, so the plate and the AVYOR
   * screen on it can never show two different moments. Mobile has no footage,
   * so it falls back to the still stand-in.
   */
  desktop: { frameInFilm: 135 },
  mobile: { scene: 0, frame: 0, production: false },
} as const;
