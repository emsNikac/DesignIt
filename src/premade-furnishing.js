import {planGeometry,footprintInArea} from './floor-plans.js';

export function furnishPlan(layout,catalog,makeItem){
  const items=[],placed=[],g=planGeometry(layout.plan);
  for(const area of g.floors){
    const r=area.region,points=r.points,xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs),center=[(minX+maxX)/2,(minZ+maxZ)/2];
    const choices=r.type!=='indoor'?(r.type==='garden'?['outdoor-plant-canopy','outdoor-leisure-picnic','outdoor-plant-vegetables','outdoor-accent-bollard']:['outdoor-seat-adirondack','outdoor-seat-bistro','outdoor-plant-flowers','outdoor-accent-solar']):r.use==='bedroom'?['bed','nightstand','dresser','plant-small']:r.use==='bathroom'?['vanity','toilet','bath','towelrack']:r.use==='kitchen'?['kitchen','fridge','island','stool-oak']:r.use==='office'?['desk','chair-wood','shelf-oak','plant-ficus']:r.use==='hall'?['bench','console','plant-ficus']:['sofa-olive','table-oak','chair-cream','table-round','lamp-paper','plant-ficus'];
    for(const id of choices){
      const def=catalog.find(d=>d.id===id);if(!def)continue;
      const candidates=[];for(let x=minX+.3;x<=maxX-.3;x+=.4)for(let z=minZ+.3;z<=maxZ-.3;z+=.4)candidates.push({x,z});candidates.sort((a,b)=>(a.x-center[0])**2+(a.z-center[1])**2-(b.x-center[0])**2-(b.z-center[1])**2);
      const p=candidates.find(p=>g.zoneAt([p.x,p.z])?.id===r.id&&footprintInArea(area.polygons,def,{...p,rotation:0,scale:1},.1)&&!placed.some(q=>Math.abs(p.x-q.x)<(def.size[0]+q.w)/2+.18&&Math.abs(p.z-q.z)<(def.size[2]+q.d)/2+.18));
      if(!p)continue;items.push(makeItem(id,p.x,p.z));placed.push({...p,w:def.size[0],d:def.size[2]});
    }
  }
  return items;
}
