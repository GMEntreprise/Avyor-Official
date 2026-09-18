import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FPS, SCENES, CUT, DURATION, TRANSITION_FRAMES, POSTER, sceneOpacity } from '../src/config/timing';
import { quadMatrix, project, sampleTrack } from '../src/lib/screen-transform';
import { ASSETS, FORMATS } from '../src/config/assets';
import { validateProduction } from '../src/lib/validate-production';

const manifest = JSON.parse(readFileSync(resolve('../../video/source/runway/manifest.json'), 'utf8'));
const rushes = Object.fromEntries(manifest.clips.map((c: { id: string }) => [c.id, c]));

describe('timeline', () => {
  test('three beats at 24fps, overlapping, with no gap and no hole', () => {
    expect(FPS).toBe(24);
    expect(SCENES).toHaveLength(3);
    expect(DURATION).toBe(175);
    for (let frame = 0; frame < DURATION; frame++) {
      const active = SCENES.filter((s) => frame >= s.from && frame < s.from + s.duration);
      expect(active.length).toBeGreaterThan(0);
      expect(active.length).toBeLessThanOrEqual(2);
      expect(active.every((s) => sceneOpacity(frame - s.from, s.index) >= 0)).toBe(true);
    }
  });

  test('the cut never asks a rush for frames it does not hold', () => {
    // The whole point of the manifest: durations come from the footage, not
    // from a round number someone liked.
    SCENES.forEach((scene, index) => {
      const rush = rushes[ASSETS[index].id];
      expect(rush).toBeDefined();
      expect(scene.trimBefore + scene.duration).toBeLessThanOrEqual(rush.frames);
      expect(scene.trimBefore).toBeGreaterThanOrEqual(0);
      expect(scene.duration).toBeGreaterThan(TRANSITION_FRAMES * 2);
    });
  });

  test('every rush of the cut is landscape, 24fps and native to the desktop format', () => {
    for (const shot of ASSETS) {
      const rush = rushes[shot.id];
      expect(rush.fps).toBe(FPS);
      expect(rush.orientation).toBe('landscape');
      expect(rush.width / rush.height).toBeCloseTo(FORMATS.desktop.width / FORMATS.desktop.height, 5);
    }
  });
});

describe('poster', () => {
  test('the desktop poster is a frame of the film, on a beat that shows AVYOR', () => {
    // Freezing a Still separately once put the plate and the tracked screen on
    // two different moments: the UI floated beside the phone.
    const at = POSTER.desktop.frameInFilm;
    expect(at).toBeGreaterThanOrEqual(0);
    expect(at).toBeLessThan(DURATION);
    const beat = SCENES.filter((s) => at >= s.from && at < s.from + s.duration).at(-1)!;
    expect(ASSETS[beat.index].ui).toBeDefined();
    // And far enough from a transition that it is not a cross-faded frame.
    expect(at - beat.from).toBeGreaterThan(TRANSITION_FRAMES);
    expect(beat.from + beat.duration - at).toBeGreaterThan(TRANSITION_FRAMES);
  });
});

describe('screen replacement', () => {
  test('maps all four screen corners, including perspective', () => {
    const quad = [[80, 30], [310, 55], [280, 570], [40, 550]] as const;
    const matrix = quadMatrix(200, 400, quad);
    [[0, 0], [200, 0], [200, 400], [0, 400]].forEach(([x, y], index) => {
      const p = project(matrix, x, y);
      expect(p[0]).toBeCloseTo(quad[index][0], 6);
      expect(p[1]).toBeCloseTo(quad[index][1], 6);
    });
  });

  test('interpolates tracked corners and clamps outside the known range', () => {
    const a = [[0, 0], [1, 0], [1, 1], [0, 1]] as const;
    const b = [[2, 2], [3, 2], [3, 3], [2, 3]] as const;
    const track = [{ frame: 0, corners: a }, { frame: 10, corners: b }];
    expect(sampleTrack(track, 5)[0]).toEqual([1, 1]);
    expect(sampleTrack(track, -5)).toEqual(a);
    expect(sampleTrack(track, 99)).toEqual(b);
  });

  test('rejects missing or degenerate geometry', () => {
    expect(() => sampleTrack([], 0)).toThrow();
    expect(() => quadMatrix(0, 400, [[0, 0], [1, 0], [1, 1], [0, 1]])).toThrow();
  });

  test('the measured track stays inside frame and moves, on every beat that shows a screen', () => {
    for (const shot of ASSETS) {
      if (!shot.ui) continue;
      const track = shot.desktop.footage?.screenTrack;
      expect(track).toBeDefined();
      const xs = track!.flatMap((k) => k.corners.map((c) => c[0]));
      const ys = track!.flatMap((k) => k.corners.map((c) => c[1]));
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...xs)).toBeLessThanOrEqual(1);
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...ys)).toBeLessThanOrEqual(1);
      // A static quad on moving footage would slide off the phone.
      expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(0.02);
    }
  });
});

describe('assets and production safety', () => {
  test('desktop is 16:9, mobile is 9:16, and every still stand-in exists', () => {
    expect(FORMATS.desktop.width / FORMATS.desktop.height).toBe(16 / 9);
    expect(FORMATS.mobile.width / FORMATS.mobile.height).toBe(9 / 16);
    for (const shot of ASSETS)
      for (const format of ['desktop', 'mobile'] as const)
        expect(existsSync(resolve('public', shot[format].image))).toBe(true);
  });

  test('desktop passes validation with the delivered rushes', () => {
    expect(validateProduction(ASSETS, 'desktop', () => true)).toEqual([]);
  });

  test('mobile is refused: no portrait rush has been delivered', () => {
    // Honest gate rather than a silently cropped landscape film.
    const errors = validateProduction(ASSETS, 'mobile', () => true);
    expect(errors.length).toBe(ASSETS.length);
    expect(errors.every((e) => e.includes('missing footage (mobile)'))).toBe(true);
  });

  test('a rush shorter than its beat, unreviewed or untracked is refused', () => {
    const base = ASSETS[1];
    const short = { ...base, desktop: { ...base.desktop, footage: { ...base.desktop.footage!, frames: 3 } } };
    expect(validateProduction([short], 'desktop', () => true).join()).toContain('the cut needs');
    const unreviewed = { ...base, desktop: { ...base.desktop, footage: { ...base.desktop.footage!, reviewed: false } } };
    expect(validateProduction([unreviewed], 'desktop', () => true).join()).toContain('review/hash');
    const untracked = { ...base, desktop: { ...base.desktop, footage: { ...base.desktop.footage!, screenTrack: undefined } } };
    expect(validateProduction([untracked], 'desktop', () => true).join()).toContain('screen tracking');
  });

  test('every rush of the cut is on disk and unchanged since review', () => {
    for (const shot of ASSETS) {
      const footage = shot.desktop.footage!;
      expect(existsSync(resolve('public', footage.file))).toBe(true);
      expect(footage.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(footage.reviewed).toBe(true);
    }
    expect(CUT).toHaveLength(3);
  });
});
