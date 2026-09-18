import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ASSETS, type Format } from '../src/config/assets';
import { validateProduction } from '../src/lib/validate-production';
import { FPS, SCENES } from '../src/config/timing';
export function checkProduction(format: Format): string[] {
  const publicDir=resolve(import.meta.dir,'../public');
  const issues=validateProduction(ASSETS,format,file=>existsSync(resolve(publicDir,file)));
  ASSETS.forEach((shot,index)=>{
    const footage=shot[format].footage;
    if(!footage || !existsSync(resolve(publicDir,footage.file))) return;
    const path=resolve(publicDir,footage.file);
    const hash=createHash('sha256').update(readFileSync(path)).digest('hex');
    if(hash!==footage.sha256) issues.push(shot.id+': footage changed since review');
    const probe=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',path],{encoding:'utf8'});
    if(probe.status!==0) {issues.push(shot.id+': ffprobe failed');return;}
    const data=JSON.parse(probe.stdout), stream=data.streams.find((s:{codec_type:string})=>s.codec_type==='video');
    if(!stream) {issues.push(shot.id+': missing video stream');return;}
    const needed=(SCENES[index].trimBefore+SCENES[index].duration)/FPS;
    if(Number(data.format.duration)<needed-.01) issues.push(shot.id+': clip shorter than the '+needed.toFixed(2)+'s the cut needs');
    const ratio=stream.width/stream.height, expected=format==='desktop'?16/9:9/16;
    if(Math.abs(ratio-expected)>.005) issues.push(shot.id+': wrong aspect ratio');
    const [n,d]=String(stream.avg_frame_rate).split('/').map(Number);
    if(Math.abs(n/d-FPS)>.01) issues.push(shot.id+': expected 24fps footage');
  });
  return issues;
}
if(import.meta.main) {
  const errors=(['desktop','mobile'] as const).flatMap(checkProduction);
  if(errors.length) {console.error(errors.join('\n'));process.exit(1);}
  console.log('Both formats pass footage, duration, ratio, fps, hash and tracking checks.');
}
