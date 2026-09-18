import { useCurrentFrame } from 'remotion';
import { SCENES, TRANSITION_FRAMES } from '../config/timing';
export function AvyorPulse() {
  const frame=useCurrentFrame();
  const transition=SCENES.slice(1).find(s=>frame>=s.from && frame<s.from+TRANSITION_FRAMES);
  if (!transition) return null;
  const phase=(frame-transition.from)/(TRANSITION_FRAMES-1);
  return <div style={{position:'absolute',inset:0,pointerEvents:'none',opacity:Math.sin(phase*Math.PI)*.06,background:'radial-gradient(ellipse at 78% 55%,#805cff,transparent 55%)'}}/>;
}
