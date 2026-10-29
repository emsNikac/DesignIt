import clipping from 'polygon-clipping';
import {ShapeUtils,Vector2} from 'three';

export const PLAN_VERSION=1;
export const WALL_STYLES=[['solid','Solid wall'],['window','Windowed wall'],['glass','Full glass'],['doorway','Doorway'],['archway','Wide opening'],['half','Half wall'],['slatted','Timber screen'],['fence','Fence / railing'],['open','Open space']];
export const ZONE_TYPES=[['indoor','Indoor room'],['terrace','Terrace / deck'],['garden','Garden'],['path','Outdoor path']];
export const OUTDOOR_SURFACES=[['grass','Meadow grass','#6f874e'],['deck','Timber decking','#a98b63'],['pavers','Stone paving','#b7b5a5'],['gravel','Garden gravel','#b9ad94'],['asphalt','Asphalt path','#626967']].map(([id,name,color])=>({id,name,color}));
export const CUTAWAY_SIDES=[['south-east','Front right'],['south-west','Front left'],['north-east','Rear right'],['north-west','Rear left'],['south','Front'],['north','Rear'],['east','Right'],['west','Left']];
export const ROUND=n=>Math.round(n*1000)/1000;
const EPS=1e-6,cache=new WeakMap();
export const point=(x,z)=>[ROUND(x),ROUND(z)];
export const rectangle=(x,z,w,d)=>[[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
export const region=(id,name,x,z,w,d,type='indoor',use='living')=>({id,name,type,use,points:rectangle(x,z,w,d),surface:type==='garden'?'grass':type==='path'?'gravel':'deck'});
export const polygonArea=points=>Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2);
export const signedArea=points=>points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0)/2;
export const multiArea=multi=>multi.reduce((sum,poly)=>sum+polygonArea(poly[0])-poly.slice(1).reduce((s,h)=>s+polygonArea(h),0),0);
export const polyInput=points=>[points.concat([points[0]])];
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function pointOnSegment(p,a,b,tolerance=EPS){return Math.abs(cross(a,b,p))<=tolerance*Math.max(1,distance(a,b))&&p[0]>=Math.min(a[0],b[0])-tolerance&&p[0]<=Math.max(a[0],b[0])+tolerance&&p[1]>=Math.min(a[1],b[1])-tolerance&&p[1]<=Math.max(a[1],b[1])+tolerance;}
export function pointInPolygon(p,points,boundary=true){
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[j],b=points[i];if(pointOnSegment(p,a,b))return boundary;
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }return inside;
}
const intersects=(a,b,c,d)=>{
  const aa=cross(a,b,c),bb=cross(a,b,d),cc=cross(c,d,a),dd=cross(c,d,b);
  return (aa*bb<-EPS&&cc*dd<-EPS)||pointOnSegment(c,a,b)||pointOnSegment(d,a,b)||pointOnSegment(a,c,d)||pointOnSegment(b,c,d);
};
export function polygonProblem(points){
  if(!Array.isArray(points)||points.length<3||points.length>64)return 'A floor outline needs 3–64 corners.';
  if(points.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>typeof n!=='number'||!Number.isFinite(n)||Math.abs(n)>32)))return 'Keep every corner inside the 32 m drawing area.';
  if(points.some((p,i)=>distance(p,points[(i+1)%points.length])<.2))return 'Wall segments must be at least 20 cm long.';
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)if(j!==i+1&&!(i===0&&j===points.length-1)&&intersects(points[i],points[(i+1)%points.length],points[j],points[(j+1)%points.length]))return 'The outline crosses itself. Move or remove the crossing corners.';
  if(polygonArea(points)<.5)return 'Each floor area must be at least 0.5 m².';
  return '';
}
export const wallKey=(a,b)=>[a,b].map(p=>p.map(ROUND).join(',')).sort().join('|');
export const planBounds=plan=>{
  const points=plan.regions.flatMap(r=>r.points),xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);
  return points.length?{minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)}:{minX:-4,maxX:4,minZ:-3,maxZ:3};
};
export function planGeometry(plan){
  if(cache.has(plan))return cache.get(plan);
  const ordered=[...plan.regions].sort((a,b)=>polygonArea(a.points)-polygonArea(b.points));
  const union=ordered.length?clipping.union(...ordered.map(r=>polyInput(r.points))):[];
  const zoneAt=p=>ordered.find(r=>pointInPolygon(p,r.points,false));
  const source=plan.regions.flatMap(r=>r.points.map((a,i)=>({a,b:r.points[(i+1)%r.points.length]}))),segments=new Map();
  for(const edge of source){
    const {a,b}=edge,len=distance(a,b);if(len<EPS)continue;
    const cuts=[a,b];for(const other of source)for(const p of [other.a,other.b])if(pointOnSegment(p,a,b))cuts.push(p);
    const dx=b[0]-a[0],dz=b[1]-a[1],sorted=[...new Map(cuts.map(p=>[p.join(','),p])).values()].sort((p,q)=>((p[0]-q[0])*dx+(p[1]-q[1])*dz));
    for(let i=0;i<sorted.length-1;i++){
      let p=sorted[i],q=sorted[i+1];if(distance(p,q)<.01)continue;
      if(p.join(',')>q.join(','))[p,q]=[q,p];const key=wallKey(p,q);if(segments.has(key))continue;
      const length=distance(p,q),nx=-(q[1]-p[1])/length,nz=(q[0]-p[0])/length,m=[(p[0]+q[0])/2,(p[1]+q[1])/2];
      const aZone=zoneAt([m[0]+nx*.015,m[1]+nz*.015]),bZone=zoneAt([m[0]-nx*.015,m[1]-nz*.015]);
      if(aZone?.id===bZone?.id)continue;
      const interior=aZone?.type==='indoor'&&bZone?.type==='indoor';
      const indoor=aZone?.type==='indoor'?aZone:bZone?.type==='indoor'?bZone:null;
      const outward=indoor?(aZone===indoor?[-nx,-nz]:[nx,nz]):!bZone?[-nx,-nz]:[nx,nz];
      segments.set(key,{id:key,a:p,b:q,length,mid:m,rotation:-Math.atan2(q[1]-p[1],q[0]-p[0]),aZone:aZone?.id,bZone:bZone?.id,interior:!!interior,indoor:!!indoor,outward,style:plan.wallStyles?.[key]||'solid'});
    }
  }
  let covered=[];const floors=[];
  for(const r of ordered){const poly=polyInput(r.points),area=covered.length?clipping.difference(poly,covered):clipping.union(poly);floors.push({region:r,polygons:area});covered=covered.length?clipping.union(covered,poly):clipping.union(poly);}
  const result={union,segments:[...segments.values()],floors,zoneAt};cache.set(plan,result);return result;
}
export function planProblem(plan){
  if(!plan||plan.version!==PLAN_VERSION||!Array.isArray(plan.regions)||!plan.regions.length||plan.regions.length>40)return 'Add between 1 and 40 connected floor areas.';
  const ids=new Set();let corners=0;
  for(const r of plan.regions){if(!r||typeof r.id!=='string'||r.id.length>100||ids.has(r.id)||!ZONE_TYPES.some(t=>t[0]===r.type))return 'Each area needs a unique identity and valid area type.';ids.add(r.id);corners+=r.points?.length||0;const problem=polygonProblem(r.points);if(problem)return `${String(r.name||'Area').slice(0,40)}: ${problem}`;}
  if(corners>256)return 'Use at most 256 corners in one layout.';
  const b=planBounds(plan);if(b.maxX-b.minX>32||b.maxZ-b.minZ>32)return 'The complete layout must fit inside 32 × 32 m.';
  if(!plan.regions.some(r=>r.type==='indoor'))return 'Add at least one indoor room.';
  try{
    for(let i=0;i<plan.regions.length;i++)for(let j=i+1;j<plan.regions.length;j++){
      const a=plan.regions[i],b=plan.regions[j],overlap=multiArea(clipping.intersection(polyInput(a.points),polyInput(b.points))),aa=polygonArea(a.points),bb=polygonArea(b.points);
      if(overlap>EPS&&Math.abs(overlap-Math.min(aa,bb))>.001)return 'Rooms partially overlap. Join their edges, or place one room fully inside a larger floor outline.';
      if(Math.abs(aa-bb)<.001&&overlap>aa-.001)return 'Two areas occupy the same space. Move or remove one of them.';
    }
    const geometry=planGeometry(plan);if(geometry.union.length!==1)return 'Connect every area along an edge. Separate islands and corner-only joins are not supported.';
    if(geometry.segments.length>400)return 'This floor plan has too many wall segments.';
  }catch{return 'These outlines cannot form a floor. Check the corner connections.';}
  if(!CUTAWAY_SIDES.some(s=>s[0]===plan.cutaway))return 'Choose the open viewing side.';
  if(Object.values(plan.wallStyles||{}).some(style=>!WALL_STYLES.some(s=>s[0]===style)))return 'Choose a supported wall style.';
  return '';
}
export function translatePlan(plan,dx,dz){
  const wallStyles={};for(const s of planGeometry(plan).segments)wallStyles[wallKey(point(s.a[0]+dx,s.a[1]+dz),point(s.b[0]+dx,s.b[1]+dz))]=plan.wallStyles?.[s.id]||s.style;
  return {...plan,regions:plan.regions.map(r=>({...r,points:r.points.map(p=>point(p[0]+dx,p[1]+dz))})),wallStyles};
}
export function lockPlan(draft,id){
  const problem=planProblem(draft);if(problem)throw new Error(problem);
  const b=planBounds(draft),shifted=translatePlan(draft,-(b.minX+b.maxX)/2,-(b.minZ+b.maxZ)/2);
  const plan={version:PLAN_VERSION,id:id||`plan-${globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2)}`,name:String(draft.name||'My floor plan').trim().slice(0,80)||'My floor plan',locked:true,cutaway:draft.cutaway,wallStyles:shifted.wallStyles,regions:shifted.regions.map(r=>({id:r.id,name:String(r.name||'Room').slice(0,50),type:r.type,use:['living','bedroom','bathroom','kitchen','hall','office'].includes(r.use)?r.use:'living',surface:OUTDOOR_SURFACES.some(s=>s.id===r.surface)?r.surface:r.type==='garden'?'grass':'deck',points:r.points.map(p=>p.map(ROUND))}))};
  return deepFreeze(plan);
}
function deepFreeze(value){Object.values(value).forEach(v=>{if(v&&typeof v==='object')deepFreeze(v);});return Object.freeze(value);}
export function validateLockedPlan(value){
  if(!value||value.locked!==true||typeof value.id!=='string'||!value.id.startsWith('plan-')||value.id.length>100)throw new Error('This design needs a confirmed, locked floor plan.');
  const problem=planProblem(value);if(problem)throw new Error(problem);
  // Canonical normalization also strips unsupported imported metadata.
  return lockPlan(value,value.id);
}
export const copyPlan=plan=>({...structuredClone(plan),locked:false,id:undefined,name:`${plan.name} — copy`});
export function planLayout(plan){
  const b=planBounds(plan),g=planGeometry(plan),area=multiArea(g.union),indoor=g.floors.reduce((n,f)=>n+(f.region.type==='indoor'?multiArea(f.polygons):0),0);
  return {id:plan.id,name:plan.name,plan,width:b.maxX-b.minX,depth:b.maxZ-b.minZ,center:[(b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2],area:Math.round(area*10)/10,indoorArea:Math.round(indoor*10)/10,outdoorArea:Math.round((area-indoor)*10)/10,rooms:`${plan.regions.filter(r=>r.type==='indoor').length} rooms`,style:'Single-floor home',subtitle:'Your own shape. A space to make yours.'};
}
export function layoutWallSegments(layout){
  if(layout.plan)return planGeometry(layout.plan).segments;
  return [{id:'legacy-west',length:layout.depth,interior:false},{id:'legacy-north',length:layout.width,interior:false},...(layout.partitions?[{id:'legacy-divider-north',length:layout.depth*.42,interior:true},{id:'legacy-divider-south',length:layout.depth*.18,interior:true},{id:'legacy-bathroom',length:layout.width/2-1.45,interior:true}]:[])];
}
export function containsFloor(layout,p,margin=0){
  if(!layout.plan)return Math.abs(p.x)<=layout.width/2-margin&&Math.abs(p.z)<=layout.depth/2-margin;
  const g=planGeometry(layout.plan),inside=point=>g.union.some(poly=>pointInPolygon(point,poly[0])&&!poly.slice(1).some(h=>pointInPolygon(point,h,false)));
  if(!inside([p.x,p.z]))return false;
  return !margin||[[margin,0],[-margin,0],[0,margin],[0,-margin]].every(([x,z])=>inside([p.x+x,p.z+z]));
}
export function footprintPolygon(def,item,padding=.04){
  const scale=item.scale||1,c=Math.cos(item.rotation||0),s=Math.sin(item.rotation||0),w=def.size[0]*scale/2+padding,d=def.size[2]*scale/2+padding;
  return [[-w,-d],[w,-d],[w,d],[-w,d]].map(([x,z])=>[item.x+x*c+z*s,item.z-x*s+z*c]);
}
export function footprintInArea(polygons,def,item,padding=.04){return !!polygons.length&&multiArea(clipping.difference(polyInput(footprintPolygon(def,item,padding)),polygons))<.0001;}
export function footprintOnFloor(layout,def,item,padding=.04){
  const points=footprintPolygon(def,item,padding);
  if(!points.every(([x,z])=>containsFloor(layout,{x,z})))return false;
  return !layout.plan||multiArea(clipping.difference(polyInput(points),planGeometry(layout.plan).union))<.0001;
}
export function wallSectionsForPlan(style,length,height=3){
  const box=(w,h,d,x=0,y=h/2,z=0,part='body')=>({width:w,height:h,depth:d,x,y,z,part});
  if(style==='open')return [];
  if(style==='half'||style==='fence')return [box(length,style==='half'?1.1:1,.12)];
  if(style==='doorway'||style==='archway'){
    const opening=Math.min(style==='archway'?2.2:1.05,length*.72),side=(length-opening)/2,top=2.2;
    return [box(side,height,.14,-(length+opening)/4),box(side,height,.14,(length+opening)/4),box(opening,height-top,.14,0,(height+top)/2)];
  }
  if(style==='window'){
    const opening=length*.72,side=(length-opening)/2,bottom=.85,top=2.65;
    return [box(side,height,.14,-(length+opening)/4),box(side,height,.14,(length+opening)/4),box(opening,bottom,.14),box(opening,height-top,.14,0,(height+top)/2),box(opening,top-bottom,.02,0,(top+bottom)/2,0,'glass')];
  }
  return [box(length,height,style==='glass'?.025:.14,0,height/2,0,style==='glass'?'glass':'body')];
}
export function blocksPlanWall(segment,p,margin=.18){
  const dx=p.x-segment.mid[0],dz=p.z-segment.mid[1],c=Math.cos(segment.rotation),s=Math.sin(segment.rotation),x=dx*c-dz*s,z=dx*s+dz*c;
  return wallSectionsForPlan(segment.style,segment.length).some(b=>b.y-b.height/2<1.8&&b.y+b.height/2>.2&&Math.abs(x-b.x)<b.width/2+margin&&Math.abs(z-b.z)<b.depth/2+margin);
}
export function cutawayWall(segment,side){
  if(segment.interior||!segment.indoor)return false;
  const x=side.includes('east')?1:side.includes('west')?-1:0,z=side.includes('south')?1:side.includes('north')?-1:0;
  return segment.outward[0]*x+segment.outward[1]*z>.3;
}
export function floorTriangles(plan){
  const triangles=[];for(const poly of planGeometry(plan).union){const rings=poly.map(r=>r.slice(0,-1).map(p=>new Vector2(p[0],p[1]))),vertices=rings.flat();for(const face of ShapeUtils.triangulateShape(rings[0],rings.slice(1))){const p=face.map(i=>vertices[i].toArray());if(signedArea(p)<0)p.reverse();triangles.push(p);}}return triangles;
}
export function draftFromLayout(layout){
  if(layout.plan)return copyPlan(layout.plan);
  const w=layout.width,d=layout.depth,regions=layout.partitions?[region('living','Living area',-w/2,-d/2,w/2+1.45,d),region('bedroom','Bedroom',1.45,-d/2,w/2-1.45,d/2+.45,'indoor','bedroom'),region('bathroom','Bathroom',1.45,.45,w/2-1.45,d/2-.45,'indoor','bathroom')]:[region('main','Open living space',-w/2,-d/2,w,d)];
  const plan={version:1,name:`${layout.name} — copy`,regions,wallStyles:{},cutaway:'south-east',locked:false};
  for(const s of planGeometry(plan).segments)plan.wallStyles[s.id]=s.interior?'doorway':s.outward[1]<-.5?'window':'solid';return plan;
}

export function wallItemPosition(layout,def){
  if(!layout.plan)return null;
  const walls=[...planGeometry(layout.plan).segments].sort((a,b)=>Number(cutawayWall(a,layout.plan.cutaway))-Number(cutawayWall(b,layout.plan.cutaway)));
  for(const wall of walls){
    if(!wall.indoor||['slatted','fence','glass','open'].includes(wall.style))continue;
    const surface=wallSectionsForPlan(wall.style,wall.length).find(s=>s.part==='body'&&s.width>def.size[0]+.1&&s.height>def.size[1]+.1);if(!surface)continue;
    const a=layout.plan.regions.find(r=>r.id===wall.aZone),sign=a?.type==='indoor'?1:-1,angle=wall.rotation,offset=def.size[2]/2+.09;
    const item={x:wall.mid[0]+Math.cos(angle)*surface.x+Math.sin(angle)*offset*sign,z:wall.mid[1]-Math.sin(angle)*surface.x+Math.cos(angle)*offset*sign,rotation:angle+(sign<0?Math.PI:0),scale:1};
    if(footprintOnFloor(layout,def,item,0))return item;
  }return null;
}
