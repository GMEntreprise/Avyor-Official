import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { checkProduction } from './check-production';
import type { Format } from '../src/config/assets';
import { FPS, POSTER } from '../src/config/timing';
import './sync-assets';
const [mode,formatArg]=process.argv.slice(2);
if(!['preview','production','poster'].includes(mode) || !['desktop','mobile'].includes(formatArg)) throw new Error('Usage: bun scripts/render.ts preview|production|poster desktop|mobile');
const format=formatArg as Format, root=resolve(import.meta.dir,'..'), site=resolve(root,'../..');
const out=resolve(site,'video/exports',mode==='preview'?'previews':mode==='poster'?'posters':'masters');
mkdirSync(out,{recursive:true});
if(mode==='production') {
  const errors=checkProduction(format);
  if(errors.length) {console.error('Production export refused:\n'+errors.join('\n'));process.exit(1);}
}
async function run(cmd:string,args:string[]) {
  await new Promise<void>((ok,fail)=>{
    const child=spawn(cmd,args,{cwd:root,stdio:'inherit'});
    child.on('error',fail);
    child.on('exit',code=>code===0?ok():fail(new Error(cmd+' exited '+code)));
  });
}
let browser=process.env.AVYOR_VIDEO_BROWSER;
if(!browser) {
  try {
    const require=createRequire(resolve(site,'package.json'));
    const candidate=require('playwright').chromium.executablePath();
    if(existsSync(candidate)) browser=candidate;
  } catch { /* Remotion will use its managed browser. */ }
}
const browserArgs=browser?['--browser-executable='+browser]:[];
const cli=resolve(root,'node_modules/@remotion/cli/remotion-cli.js');
const capital=format==='desktop'?'Desktop':'Mobile';
if(mode==='poster' && format==='desktop') {
  // Cut from the master: the poster is a frame of the film, never a re-render.
  const master=resolve(site,'video/exports/masters/hero-avyor-desktop.mp4');
  if(!existsSync(master)) {console.error('Render the desktop master first.');process.exit(1);}
  const poster=resolve(out,'hero-avyor-desktop-poster.png');
  const at=(POSTER.desktop.frameInFilm/FPS).toFixed(4);
  await run('node',[cli,'ffmpeg','-y','-v','error','-ss',at,'-i',master,'-frames:v','1',poster]);
  // Neither Remotion's bundled ffmpeg nor the system one here can encode webp,
  // so the conversion goes through the sharp the site already depends on.
  const sharp=createRequire(resolve(site,'package.json'))('sharp');
  await sharp(poster).webp({quality:82}).toFile(poster.replace(/\.png$/,'.webp'));
} else if(mode==='poster') {
  const poster=resolve(out,'hero-avyor-'+format+'-poster.png');
  await run('node',[cli,'still','src/index.ts','AvyorHeroPosterMobile',poster,'--image-format=png',...browserArgs]);
  await run('node',[cli,'still','src/index.ts','AvyorHeroPosterMobile',poster.replace(/\.png$/,'.webp'),...browserArgs]);
} else {
  const name=mode==='preview'?'avyor-animatic-'+format:'hero-avyor-'+format;
  const output=resolve(out,name+'.mp4');
  await run('node',[cli,'render','src/index.ts',(mode==='preview'?'AvyorAnimatic':'AvyorHero')+capital,output,'--codec=h264','--crf='+(mode==='preview'?'20':'16'),'--pixel-format=yuv420p','--concurrency=2',...browserArgs]);
  if(mode==='production') {
    const web=resolve(site,'video/exports/web');mkdirSync(web,{recursive:true});
    // The film is shown at full opacity, so the AVYOR screens on the phones
    // have to stay readable: resolution is kept, the bitrate is what gives.
    await run('node',[cli,'ffmpeg','-y','-v','error','-i',output,'-an','-c:v','libx264','-preset','slow','-crf','27','-pix_fmt','yuv420p','-movflags','+faststart',resolve(web,name+'.mp4')]);
    await run('node',[cli,'ffmpeg','-y','-v','error','-i',output,'-an','-c:v','libvpx-vp9','-b:v','0','-crf','36',resolve(web,name+'.webm')]);
  }
}
