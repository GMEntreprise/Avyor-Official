export type Point = readonly [number, number];
export type Quad = readonly [Point, Point, Point, Point];
export type Track = readonly { frame: number; corners: Quad }[];
// Project a rectangle onto four measured corners, using CSS column-major matrix3d.
export function quadMatrix(width: number, height: number, q: Quad): number[] {
  if (width <= 0 || height <= 0) throw new Error('Invalid screen dimensions');
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]] = q;
  const dx1=x1-x2, dx2=x3-x2, dx3=x0-x1+x2-x3;
  const dy1=y1-y2, dy2=y3-y2, dy3=y0-y1+y2-y3;
  const det=dx1*dy2-dx2*dy1;
  if (Math.abs(det)<1e-10) throw new Error('Degenerate screen corners');
  const g=(dx3*dy2-dx2*dy3)/det, h=(dx1*dy3-dx3*dy1)/det;
  return [(x1-x0+g*x1)/width,(y1-y0+g*y1)/width,0,g/width,
    (x3-x0+h*x3)/height,(y3-y0+h*y3)/height,0,h/height,
    0,0,1,0, x0,y0,0,1];
}
export function project(m: number[], x: number, y: number): Point {
  const w=m[3]*x+m[7]*y+m[15];
  return [(m[0]*x+m[4]*y+m[12])/w,(m[1]*x+m[5]*y+m[13])/w];
}
export function sampleTrack(track: Track, frame: number): Quad {
  if (!track.length) throw new Error('Missing screen tracking');
  if (frame<=track[0].frame) return track[0].corners;
  const last=track[track.length-1];
  if (frame>=last.frame) return last.corners;
  const next=track.findIndex(k=>k.frame>=frame);
  const a=track[next-1], b=track[next], t=(frame-a.frame)/(b.frame-a.frame);
  return a.corners.map((p,i)=>[p[0]+(b.corners[i][0]-p[0])*t,p[1]+(b.corners[i][1]-p[1])*t]) as unknown as Quad;
}
