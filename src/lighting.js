// A consistent exposure lets night stay dark instead of auto-brightening it.
// Intensities are artistic photometric approximations, not an astronomical model.
export function daylightState(time){
  const t=((time%24)+24)%24,day=Math.max(0,Math.sin((t-6)*Math.PI/12)),night=1-Math.min(1,day*5),golden=day>0&&day<.45;
  return {day,night,golden,celestialIntensity:day>0?day*3.2:.4,
    celestialColor:day>0?(golden?'#ffd4a1':'#fff0db'):'#9eb9ee',
    x:day>0?Math.cos((t-6)*Math.PI/12)*9:Math.sin((t-18)*Math.PI/12)*7,
    height:day>0?1.2+day*9:4+Math.cos(t*Math.PI/12)*2,
    hemisphere:.055+day*1.15,fill:day*.35,environment:.035+day*.62,
    sky:day>.1?(golden?'#d8c5a1':'#d8dfd3'):'#17253e',background:day>.1?'#eeeee7':'#252c39'};
}

import {planGeometry,polygonArea,pointInPolygon} from './floor-plans.js';
import {ShapeUtils,Vector2} from 'three';
export function roomLightPositions(layout){
  if(layout.plan){return planGeometry(layout.plan).floors.filter(f=>f.region.type==='indoor'&&f.polygons.length).slice(0,12).map(f=>{
    const points=f.region.points,center=[points.reduce((s,p)=>s+p[0],0)/points.length,points.reduce((s,p)=>s+p[1],0)/points.length];
    if(f.polygons.some(p=>pointInPolygon(center,p[0],false)&&!p.slice(1).some(h=>pointInPolygon(center,h))))return [center[0],2.92,center[1]];
    const triangles=f.polygons.flatMap(poly=>{const rings=poly.map(r=>r.slice(0,-1).map(p=>new Vector2(...p))),vertices=rings.flat();return ShapeUtils.triangulateShape(rings[0],rings.slice(1)).map(face=>face.map(i=>vertices[i].toArray()));}).sort((a,b)=>polygonArea(b)-polygonArea(a));
    const t=triangles[0];return [t.reduce((s,p)=>s+p[0],0)/3,2.92,t.reduce((s,p)=>s+p[1],0)/3];
  });}
  return layout.partitions?[[-layout.width*.23,2.92,0],[layout.width*.28,2.92,-layout.depth*.25],[layout.width*.28,2.92,layout.depth*.28]]:[[-layout.width*.24,2.92,-layout.depth*.1],[layout.width*.23,2.92,layout.depth*.08]];
}
