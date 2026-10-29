import {CATALOG,getLayout} from './catalog.js';
import {itemDefinition} from './architecture.js';
import {footprintOnFloor,planGeometry} from './floor-plans.js';
import {createWorld,createBody,canPlaceBody} from './physics.js';

export const itemElevation=def=>def.elevation??(def.ceiling?Math.max(.1,3.05-def.size[1]):def.wall?Math.max(.1,(3.1-def.size[1])/2):0);

export function footprint(def,item={rotation:0,scale:1,x:0,z:0}){
  def=itemDefinition(def,item);
  const c=Math.abs(Math.cos(item.rotation||0)),s=Math.abs(Math.sin(item.rotation||0)),scale=item.scale||1;
  return {x:item.x||0,z:item.z||0,halfX:(def.size[0]*c+def.size[2]*s)*scale/2,halfZ:(def.size[0]*s+def.size[2]*c)*scale/2};
}
export function findPlacement(def,design){
  const layout=getLayout(design),halfX=def.size[0]/2,halfZ=def.size[2]/2;
  const minX=-layout.width/2+halfX+.12,maxX=layout.width/2-halfX-.12;
  const minZ=-layout.depth/2+halfZ+.12,maxZ=layout.depth/2-halfZ-.12;
  const occupied=design.items.flatMap(item=>{const d=CATALOG.find(d=>d.id===item.catalogId);return d&&!d.rug&&!d.small&&!d.ceiling&&!d.wall&&item.y<1.8?[footprint(d,item)]:[];});
  const candidates=[];
  for(let x=minX;x<=maxX+.001;x+=.5)for(let z=minZ;z<=maxZ+.001;z+=.5)candidates.push({x,z});
  const preferredZ=Math.min(maxZ,layout.depth*.22);
  candidates.unshift({x:Math.max(minX,Math.min(maxX,0)),z:preferredZ});
  candidates.sort((a,b)=>(a.x*a.x+(a.z-preferredZ)**2)-(b.x*b.x+(b.z-preferredZ)**2));
  const world=layout.plan?createWorld(layout):null,body=world?createBody(def,{x:0,y:itemElevation(def),z:0,scale:1,rotation:0}):null;
  if(layout.plan){const zones=planGeometry(layout.plan);candidates.sort((a,b)=>Number(zones.zoneAt([a.x,a.z])?.type!==(def.outdoor?'terrace':'indoor'))-Number(zones.zoneAt([b.x,b.z])?.type!==(def.outdoor?'terrace':'indoor')));}
  return candidates.find(p=>{
    if(!footprintOnFloor(layout,def,{...p,rotation:0,scale:1}))return false;
    if(!def.rug&&!def.small&&!def.ceiling&&occupied.some(o=>Math.abs(p.x-o.x)<halfX+o.halfX+.08&&Math.abs(p.z-o.z)<halfZ+o.halfZ+.08))return false;
    if(body){body.position.set(p.x,itemElevation(def),p.z);body.aabbNeedsUpdate=true;if(!canPlaceBody(world,body,world.bodies))return false;}return true;
  })||null;
}
