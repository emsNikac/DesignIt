import * as THREE from 'three';
import {sharedGeometry} from './mesh-optimizer.js';

export function outline(kind,w,d){
  const s=new THREE.Shape(),x=w/2,z=d/2;
  if(['round','oval'].includes(kind)){s.absellipse(0,0,x,z,0,Math.PI*2,false,0);return s;}
  if(['triangle','hexagon','octagon','scallop'].includes(kind)){
    const count=kind==='triangle'?3:kind==='hexagon'?6:kind==='octagon'?8:64;
    for(let i=0;i<count;i++){const a=i/count*Math.PI*2,r=kind==='scallop'?1-.07*(1+Math.cos(a*8)):1,px=Math.sin(a)*x*r,pz=Math.cos(a)*z*r;i?s.lineTo(px,pz):s.moveTo(px,pz);}s.closePath();return s;
  }
  if(kind==='kidney'){s.moveTo(-x,0);s.bezierCurveTo(-x,-z,x*.6,-z,x,z*.1);s.bezierCurveTo(x,z,-x*.05,z,-x*.2,z*.25);s.bezierCurveTo(-x*.3,-z*.1,-x*.65,z*.8,-x,0);return s;}
  const r=kind==='racetrack'?Math.min(x,z):Math.min(.06,x/3,z/3);
  s.moveTo(-x+r,-z);s.lineTo(x-r,-z);s.quadraticCurveTo(x,-z,x,-z+r);s.lineTo(x,z-r);s.quadraticCurveTo(x,z,x-r,z);s.lineTo(-x+r,z);s.quadraticCurveTo(-x,z,-x,z-r);s.lineTo(-x,-z+r);s.quadraticCurveTo(-x,-z,-x+r,-z);return s;
}
export function designHelpers(h){
  const arc=(g,points,r,m,closed=false)=>{
    const key=`curve:${JSON.stringify(points)}:${r}:${closed}`;
    const geometry=sharedGeometry(key,()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed),Math.max(16,points.length*4),r,8,closed));
    return h.mesh(g,geometry,m);
  };
  const panel=(g,kind,w,d,thickness,y,m)=>h.mesh(g,sharedGeometry(`panel:${kind}:${w}:${d}:${thickness}`,()=>{
    const geometry=new THREE.ExtrudeGeometry(outline(kind,w,d),{depth:thickness,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:2,curveSegments:32});
    const {position,normal,uv}=geometry.attributes;
    for(let i=0;i<position.count;i++)if(Math.abs(normal.getZ(i))>.9)uv.setXY(i,Math.max(0,Math.min(1,(position.getX(i)+w/2)/w)),Math.max(0,Math.min(1,(position.getY(i)+d/2)/d)));
    return geometry;
  }),m,0,y,0,Math.PI/2);
  return {...h,arc,panel,outline};
}
