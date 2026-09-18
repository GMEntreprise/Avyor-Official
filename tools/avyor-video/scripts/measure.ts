import { readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const output=resolve(import.meta.dir,'../../../video/exports');
const reports=[];
for(const file of readdirSync(output,{recursive:true}).filter(f=>/\.(mp4|webm)$/.test(String(f)))) {
  const r=spawnSync('ffprobe',['-v','error','-show_entries','format=duration,size,bit_rate:stream=codec_name,codec_type,width,height,avg_frame_rate','-of','json',resolve(output,String(file))],{encoding:'utf8'});
  if(r.status!==0)throw new Error(r.stderr);
  reports.push({file,...JSON.parse(r.stdout)});
}
writeFileSync(resolve(output,'measurements.json'),JSON.stringify(reports,null,2)+'\n');
console.log(JSON.stringify(reports,null,2));
