import { Img, staticFile } from 'remotion';
import { quadMatrix, type Quad } from '../lib/screen-transform';
export function PhoneScreen({src,corners,opacity=1}:{src:string;corners:Quad;opacity?:number}) {
  const width=660,height=1433;
  const matrix=quadMatrix(width,height,corners);
  return <div style={{position:'absolute',left:0,top:0,width,height,transformOrigin:'0 0',transform:'matrix3d('+matrix.join(',')+')',borderRadius:48,overflow:'hidden',opacity,background:'#0b1021'}}>
    <Img src={staticFile(src)} style={{width:'100%',height:'100%',objectFit:'fill'}} />
    <div style={{position:'absolute',inset:0,background:'linear-gradient(125deg,rgba(255,255,255,.045),transparent 65%)'}}/>
  </div>;
}
