import {CATALOG,LAYOUTS} from './catalog.js';
import {itemDefinition} from './architecture.js';

export function footprint(def,item={rotation:0,scale:1,x:0,z:0}){
  def=itemDefinition(def,item);
  const c=Math.abs(Math.cos(item.rotation||0)),s=Math.abs(Math.sin(item.rotation||0)),scale=item.scale||1;
  return {x:item.x||0,z:item.z||0,halfX:(def.size[0]*c+def.size[2]*s)*scale/2,halfZ:(def.size[0]*s+def.size[2]*c)*scale/2};
}
export function findPlacement(def,design){
  const layout=LAYOUTS.find(l=>l.id===design.layoutId),halfX=def.size[0]/2,halfZ=def.size[2]/2;
  const minX=-layout.width/2+halfX+.12,maxX=layout.width/2-halfX-.12;
  const minZ=-layout.depth/2+halfZ+.12,maxZ=layout.depth/2-halfZ-.12;
  const occupied=design.items.flatMap(item=>{const d=CATALOG.find(d=>d.id===item.catalogId);return d&&!d.rug&&!d.small&&!d.ceiling&&!d.wall&&item.y<1.8?[footprint(d,item)]:[];});
  const candidates=[];
  for(let x=minX;x<=maxX+.001;x+=.5)for(let z=minZ;z<=maxZ+.001;z+=.5)candidates.push({x,z});
  const preferredZ=Math.min(maxZ,layout.depth*.22);
  candidates.unshift({x:Math.max(minX,Math.min(maxX,0)),z:preferredZ});
  candidates.sort((a,b)=>(a.x*a.x+(a.z-preferredZ)**2)-(b.x*b.x+(b.z-preferredZ)**2));
  return candidates.find(p=>!occupied.some(o=>Math.abs(p.x-o.x)<halfX+o.halfX+.08&&Math.abs(p.z-o.z)<halfZ+o.halfZ+.08))||null;
}
