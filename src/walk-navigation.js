import {blocksWallWalk} from './architecture.js';

export function walkBlocked(layout,objects,point,ignoreFurniture=false){
  const margin=.23;
  if(Math.abs(point.x)>layout.width/2-margin||Math.abs(point.z)>layout.depth/2-margin)return true;
  if(layout.partitions&&((Math.abs(point.x-1.45)<.25&&(point.z<-layout.depth*.08||point.z>layout.depth*.32))||(point.x>1.45&&Math.abs(point.z-.45)<.25)))return true;
  for(const o of objects){
    if(o.def.architecture){if(blocksWallWalk(o.def,o.item,point))return true;}
    else if(!ignoreFurniture&&!o.def.rug&&!o.def.small&&!o.def.ceiling&&!o.def.wall){const b=o.bounds;if(b&&b.max.y>.25&&b.min.y<1.8&&point.x>b.min.x-.18&&point.x<b.max.x+.18&&point.z>b.min.z-.18&&point.z<b.max.z+.18)return true;}
  }
  return false;
}

export function findWalkSpawn(layout,objects,preferred){
  const free=p=>!walkBlocked(layout,objects,p),hasExit=p=>[[.38,0],[-.38,0],[0,.38],[0,-.38]].some(([x,z])=>free({x:p.x+x/2,z:p.z+z/2})&&free({x:p.x+x,z:p.z+z}));
  if(free(preferred)&&hasExit(preferred))return {...preferred};
  const candidates=[];
  for(let x=-layout.width/2+.3;x<=layout.width/2-.3;x+=.3)for(let z=-layout.depth/2+.3;z<=layout.depth/2-.3;z+=.3)candidates.push({x,z});
  candidates.sort((a,b)=>(a.x-preferred.x)**2+(a.z-preferred.z)**2-(b.x-preferred.x)**2-(b.z-preferred.z)**2);
  return candidates.find(p=>free(p)&&hasExit(p))||candidates.find(free)||null;
}

export function slideWalk(layout,objects,start,delta,ignoreFurniture=false){
  const p={x:start.x,z:start.z},steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.09));
  for(let i=0;i<steps;i++){
    const x=Math.max(-layout.width/2+.24,Math.min(layout.width/2-.24,p.x+delta.x/steps)),z=Math.max(-layout.depth/2+.24,Math.min(layout.depth/2-.24,p.z+delta.z/steps));
    if(!walkBlocked(layout,objects,{x,z},ignoreFurniture)){p.x=x;p.z=z;}
    else{if(!walkBlocked(layout,objects,{x,z:p.z},ignoreFurniture))p.x=x;if(!walkBlocked(layout,objects,{x:p.x,z},ignoreFurniture))p.z=z;}
  }
  return p;
}
