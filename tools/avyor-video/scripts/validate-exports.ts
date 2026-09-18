import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DURATION, FPS } from '../src/config/timing';
import { FORMATS } from '../src/config/assets';
const root=resolve(import.meta.dir,'../../../video/exports');
const results=[];
for(const format of ['desktop','mobile'] as const) {
  const file=resolve(root,'previews/avyor-animatic-'+format+'.mp4');
  const probe=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'});
  if(probe.status!==0)throw new Error(probe.stderr);
  const meta=JSON.parse(probe.stdout), video=meta.streams.find((s:{codec_type:string})=>s.codec_type==='video');
  if(video.width!==FORMATS[format].width || video.height!==FORMATS[format].height || Number(video.nb_frames)!==DURATION || Math.abs(Number(meta.format.duration)-DURATION/FPS)>.01 || meta.streams.some((s:{codec_type:string})=>s.codec_type==='audio')) throw new Error(format+': incorrect output specification');
  const black=spawnSync('ffmpeg',['-hide_banner','-i',file,'-vf','blackdetect=d=0:pix_th=0.02:pic_th=0.999','-an','-f','null','-'],{encoding:'utf8',maxBuffer:8e6});
  if(black.status!==0 || black.stderr.includes('black_start:'))throw new Error(format+': black-frame check failed');
  const raw=spawnSync('ffmpeg',['-v','error','-i',file,'-vf',`select='eq(n,0)+eq(n,${DURATION-1})'`,'-vsync','0','-f','rawvideo','-pix_fmt','rgb24','-'],{maxBuffer:32e6});
  if(raw.status!==0)throw new Error(String(raw.stderr));
  const frameSize=video.width*video.height*3;
  if(raw.stdout.length!==frameSize*2)throw new Error('Expected two decoded frames');
  let sum=0;for(let i=0;i<frameSize;i++)sum+=Math.abs(raw.stdout[i]-raw.stdout[i+frameSize]);
  const mae=sum/frameSize;
  if(mae>2)throw new Error(format+': loop boundary differs too much ('+mae+')');
  results.push({format,durationSeconds:Number(meta.format.duration),frames:DURATION,width:video.width,height:video.height,bytes:Number(meta.format.size),audio:false,blackFramesDetected:false,firstLastMeanAbsoluteRGBDifference:mae,scope:'animatic only; final Runway clips remain unvalidated'});
}
writeFileSync(resolve(root,'validation.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
