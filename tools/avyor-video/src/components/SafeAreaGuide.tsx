import type { Format } from '../config/assets';
export function SafeAreaGuide({format}:{format:Format}) {
  return <div style={{position:'absolute',left:0,top:0,width:format==='desktop'?'40%':'100%',height:format==='desktop'?'100%':'18%',border:'2px dashed #a99aff',background:'rgba(120,88,255,.08)',pointerEvents:'none'}}/>;
}
