import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { type Format } from '../config/assets';
import { DURATION, LOOP_FRAMES, SCENES, sceneOpacity } from '../config/timing';
import { ShotScene } from '../scenes/ShotScene';
import { CinematicOverlay } from '../components/CinematicOverlay';
import { AvyorPulse } from '../components/AvyorPulse';
import { SafeAreaGuide } from '../components/SafeAreaGuide';
export type HeroProps={format:Format;production?:boolean;showGuides?:boolean};
export function AvyorHero({format,production=false,showGuides=false}:HeroProps) {
  const frame=useCurrentFrame(), {width,height}=useVideoConfig();
  const loopOpacity=Math.max(0,Math.min(1,(frame-(DURATION-LOOP_FRAMES))/(LOOP_FRAMES-1)));
  return <AbsoluteFill style={{backgroundColor:'#080d1e',overflow:'hidden'}}>
    {SCENES.map(s=><Sequence key={s.name} from={s.from} durationInFrames={s.duration} name={s.name}>
      <AbsoluteFill style={{opacity:sceneOpacity(frame-s.from,s.index)}}>
        <ShotScene index={s.index} frame={frame-s.from} {...{format,production,width,height}}/>
      </AbsoluteFill>
    </Sequence>)}
    {loopOpacity>0 && <AbsoluteFill style={{opacity:loopOpacity}}>
      <Sequence from={DURATION-LOOP_FRAMES} name="Return to opening">
        <OpeningFrame {...{format,production,width,height}} />
      </Sequence>
    </AbsoluteFill>}
    <CinematicOverlay format={format}/><AvyorPulse/>
    {showGuides && <SafeAreaGuide format={format}/>}
  </AbsoluteFill>;
}
// A freeze avoids advancing the opening clip inside the loop crossfade.
import { Freeze } from 'remotion';
function OpeningFrame(props:{format:Format;production:boolean;width:number;height:number}) {
  return <Freeze frame={0}><ShotScene index={0} frame={0} {...props}/></Freeze>;
}
