import { AbsoluteFill } from 'remotion';
import type { Format } from '../config/assets';
export function CinematicOverlay({format}:{format:Format}) {
  return <AbsoluteFill style={{pointerEvents:'none',background:format==='desktop'
    ?'linear-gradient(90deg,rgba(4,8,21,.28),transparent 48%),radial-gradient(ellipse at center,transparent 50%,rgba(4,8,21,.13))'
    :'linear-gradient(180deg,rgba(4,8,21,.2),transparent 36%),radial-gradient(ellipse at center,transparent 50%,rgba(4,8,21,.1))'}}/>;
}
