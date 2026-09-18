import { AbsoluteFill, useVideoConfig } from 'remotion';
import { POSTER } from '../config/timing';
import { ShotScene } from '../scenes/ShotScene';
import { CinematicOverlay } from '../components/CinematicOverlay';

/**
 * The mobile poster only. Desktop freezes a frame of the rendered film instead,
 * so its plate and the AVYOR screen on it can never show two different moments.
 */
export function AvyorHeroPoster() {
  const { width, height } = useVideoConfig();
  const pick = POSTER.mobile;
  return <AbsoluteFill>
    <ShotScene index={pick.scene} frame={pick.frame} format="mobile" production={pick.production} width={width} height={height} />
    <CinematicOverlay format="mobile" />
  </AbsoluteFill>;
}
