import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as CANNON from 'cannon-es';
import {region,wallKey,planProblem,planGeometry,planLayout,lockPlan,copyPlan,validateLockedPlan,multiArea,polygonArea,floorTriangles,containsFloor,footprintOnFloor,footprintInArea,blocksPlanWall,cutawayWall,draftFromLayout} from './floor-plans.js';
import {LAYOUTS,CATALOG,validateDesign,getLayout,makeItem} from './catalog.js';
import {createCustomDesign,createDemo,saveWorkspace,loadWorkspace,readLibrary} from './designs.js';
import {createWorld,createBody,canPlaceBody} from './physics.js';
import {roomLightPositions} from './lighting.js';
import {walkBlocked,slideWalk,findWalkSpawn} from './walk-navigation.js';
import {buildPlanRoom} from './plan-scene.js';
import {disposeOwnedGeometry} from './mesh-optimizer.js';
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
const draft=regions=>({version:1,name:'Test home',regions,wallStyles:{},cutaway:'south-east'});
const storage=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};};

test('adjacent rooms split shared edges once and keep T-junctions joined',()=>{
  const p=draft([region('main','Main',-4,-3,4,6),region('top','Top',0,-3,4,3),region('bottom','Bottom',0,0,4,3)]),g=planGeometry(p);
  assert.equal(planProblem(p),'');assert.equal(multiArea(g.union),48);
  assert.equal(new Set(g.segments.map(s=>s.id)).size,g.segments.length);
  const middle=g.segments.filter(s=>s.a[0]===0&&s.b[0]===0);assert.equal(middle.length,2);assert.ok(middle.every(s=>s.interior));
  assert.ok(g.segments.some(s=>s.aZone==='top'&&s.bZone==='bottom'||s.aZone==='bottom'&&s.bZone==='top'));
});
test('contained rooms and outdoor courtyards replace floor surfaces without overlap',()=>{
  const p=draft([region('home','Home',-5,-5,10,10),region('bath','Bath',-5,-5,3,3,'indoor','bathroom'),region('garden','Garden',-1,-1,2,2,'garden')]),g=planGeometry(p);
  assert.equal(planProblem(p),'');assert.equal(multiArea(g.union),100);
  assert.equal(g.floors.reduce((sum,f)=>sum+multiArea(f.polygons),0),100);
  assert.equal(planLayout(p).indoorArea,96);assert.equal(g.zoneAt([0,0]).id,'garden');
  for(const f of g.floors)for(const other of g.floors)if(f!==other)assert.equal(footprintInArea(f.polygons,{size:[.1,.1,.1]},{x:0,z:0,scale:1,rotation:0}),f.region.id==='garden');
  assert.ok(g.segments.filter(s=>s.aZone==='bath'||s.bZone==='bath').some(s=>s.interior));
});
test('floor plan validation rejects crossings, partial overlaps, islands and malformed data',()=>{
  const invalid=[draft([{...region('a','Bad',0,0,4,4),points:[[0,0],[4,4],[0,4],[4,0]]}]),draft([region('a','A',0,0,4,4),region('b','B',2,0,4,4)]),draft([region('a','A',0,0,2,2),region('b','B',3,0,2,2)]),draft([region('a','A',0,0,2,2),region('b','B',2,2,2,2)]),draft([null]),draft([{id:'a',type:'indoor',points:null}]),draft([region('a','A',0,0,33,2)])];
  for(const p of invalid){assert.ok(planProblem(p));assert.throws(()=>lockPlan(p));}
  assert.throws(()=>validateLockedPlan({...draft([region('a','A',0,0,4,4)]),id:'plan-bad',locked:false}));
});
test('confirmation recenters a plan, retains wall styles, and produces an immutable copy',()=>{
  const p=draft([region('main','Main',6,4,4,6)]);p.wallStyles[wallKey([6,4],[10,4])]='window';
  const locked=lockPlan(p,'plan-locked'),g=planGeometry(locked);assert.equal(locked.locked,true);assert.ok(Object.isFrozen(locked.regions[0].points[0]));assert.equal(planLayout(locked).center[0],0);
  assert.equal(g.segments.find(s=>s.outward[1]<-.5).style,'window');
  assert.throws(()=>{locked.regions[0].points[0][0]=0;});
  const copy=copyPlan(locked);copy.regions[0].points[0][0]-=.5;assert.notDeepEqual(copy.regions[0].points,locked.regions[0].points);assert.equal(copy.locked,false);
  assert.deepEqual(validateLockedPlan(JSON.parse(JSON.stringify(locked))),locked);
});
const ringPlan=()=>lockPlan(draft([region('north','North',-4,-4,8,2),region('south','South',-4,2,8,2),region('west','West',-4,-2,2,4),region('east','East',2,-2,2,4)]),'plan-ring');
test('irregular floors and holes exclude walking and furniture, including footprints spanning a void',()=>{
  const p=ringPlan(),l=planLayout(p),g=planGeometry(p);assert.equal(g.union[0].length,2);assert.equal(multiArea(g.union),48);
  assert.equal(containsFloor(l,{x:0,z:0}),false);assert.equal(containsFloor(l,{x:3,z:0}),true);
  assert.equal(footprintOnFloor(l,{size:[6,1,6]},{x:0,z:0,rotation:0,scale:1},0),false);
  assert.equal(footprintOnFloor(l,{size:[1,1,1]},{x:3,z:0,rotation:Math.PI/4,scale:1}),true);
  const triangles=floorTriangles(p);assert.ok(triangles.length>4);assert.ok(Math.abs(triangles.reduce((s,t)=>s+polygonArea(t),0)-48)<1e-7);
  assert.equal(walkBlocked(l,[],{x:0,z:0}),true);
});
test('generated floors physically support objects and leave courtyard holes empty',()=>{
  const l=planLayout(ringPlan()),w=createWorld(l),def=CATALOG.find(d=>d.id==='vase'),supported=createBody(def,makeItem('vase',3,0,0,1.5));
  const falling=new CANNON.Body({mass:1,shape:new CANNON.Sphere(.1),position:new CANNON.Vec3(0,1.5,0)});w.addBody(supported);w.addBody(falling);
  for(let i=0;i<240;i++)w.step(1/60);
  assert.ok(Math.abs(supported.position.y)<.025,`supported height ${supported.position.y}`);assert.ok(falling.position.y<-10);
});
test('doorways agree between physics and walkthrough while solid walls block both',()=>{
  const p=draft([region('left','Left',-4,-3,4,6),region('right','Right',0,-3,4,6)]),divider=planGeometry(p).segments.find(s=>s.interior);
  const open=lockPlan({...p,wallStyles:{[divider.id]:'doorway'}},'plan-door'),l=planLayout(open),wall=planGeometry(open).segments.find(s=>s.interior);
  assert.equal(blocksPlanWall(wall,{x:0,z:0}),false);assert.equal(blocksPlanWall(wall,{x:0,z:1.5}),true);
  const result=slideWalk(l,[],{x:-.5,z:0},{x:1,z:0});assert.ok(result.x>.4);
  const w=createWorld(l),chair=createBody({size:[.4,.5,.4],model:'box'}, {x:0,y:0,z:0,scale:1,rotation:0});assert.equal(canPlaceBody(w,chair,w.bodies),true);
  chair.position.z=1.5;chair.aabbNeedsUpdate=true;assert.equal(canPlaceBody(w,chair,w.bodies),false);
});
test('dense furniture escape searches the real floor instead of spawning inside an irregular void',()=>{
  const l=planLayout(ringPlan()),objects=[{def:{},bounds:{min:{x:-10,y:0,z:-10},max:{x:10,y:2,z:10}}}],preferred={x:0,z:0};
  assert.equal(findWalkSpawn(l,objects,preferred),null);const escape=findWalkSpawn(l,objects,preferred,true);assert.ok(escape);assert.ok(containsFloor(l,escape,.23));assert.equal(walkBlocked(l,objects,escape,true),false);
});
test('structural wall paint uses independent sides and disposes owned materials without invalidating pooled textures',()=>{
  const p=lockPlan(draft([region('left','Left',-4,-3,4,6),region('right','Right',0,-3,4,6)])),l=planLayout(p),wall=planGeometry(p).segments.find(s=>s.interior),design={floor:'oak',bathTile:'sage',wallColor:'#e8e4d9',wallFinishes:{[wall.id]:{a:'#123456',b:'#abcdef',finish:'tile'}}},built=buildPlanRoom(l,design),group=built.planWallGroups.get(wall.id);
  assert.ok(group.visible);assert.ok(group.children.some(m=>m.material?.[4]?.color.getHexString()==='ffffff'));
  const material=group.children.find(m=>m.material?.[4])?.material[4],other=group.children.find(m=>m.material?.[5])?.material[5];assert.notEqual(material.map,other.map);assert.equal(material.roughness,.3);
  const owned=new Set(),textures=new Set();let disposals=0,textureDisposals=0;built.room.traverse(m=>{if(m.userData.ownedMaterial)for(const mat of Array.isArray(m.material)?m.material:[m.material])owned.add(mat);});
  for(const mat of owned){mat.addEventListener('dispose',()=>disposals++);if(mat.userData.sharedTextures&&mat.map)textures.add(mat.map);}for(const texture of textures)texture.addEventListener('dispose',()=>textureDisposals++);
  disposeOwnedGeometry(built.room);assert.equal(disposals,owned.size);assert.equal(textureDisposals,0);
});
test('cutaway hides chosen exterior sides and always preserves internal partitions',()=>{
  for(const l of LAYOUTS.filter(l=>l.plan)){const g=planGeometry(l.plan);assert.ok(g.segments.some(s=>cutawayWall(s,l.plan.cutaway)));assert.ok(g.segments.filter(s=>s.interior).every(s=>!cutawayWall(s,l.plan.cutaway)));}
});
test('all ten shapes are copyable; six new furnished homes stay inside their rooms',()=>{
  assert.equal(LAYOUTS.length,10);
  for(const l of LAYOUTS){assert.equal(planProblem(draftFromLayout(l)),'');if(!l.plan)continue;assert.ok(l.area>=150);const d=createDemo(l.id),g=planGeometry(l.plan);
    for(const item of d.items){const def=CATALOG.find(c=>c.id===item.catalogId);assert.ok(footprintOnFloor(l,def,item,0),`${l.id} ${def.id} outside floor`);if(def.wall)continue;const area=g.floors.find(f=>f.region.id===g.zoneAt([item.x,item.z])?.id);assert.ok(footprintInArea(area.polygons,def,item,0),`${l.id} ${def.id} crosses room`);}
    for(const [x,,z] of roomLightPositions(l))assert.equal(g.zoneAt([x,z])?.type,'indoor');
  }
});
test('saved custom structure stays locked while furniture, paint and outdoor surfaces can change',()=>{
  const s=storage(),design=createCustomDesign(draft([region('room','Room',-3,-3,6,6),region('garden','Garden',-3,3,6,3,'garden')]));
  saveWorkspace(s,design);const restored=loadWorkspace(s);assert.equal(getLayout(restored).outdoorArea,18);
  const wall=planGeometry(restored.floorPlan).segments[0];const edited={...restored,wallFinishes:{[wall.id]:{a:'#123456',b:'#abcdef',finish:'wood'}},zoneSurfaces:{garden:'gravel'},items:[makeItem('chair-wood',0,0)]};saveWorkspace(s,edited);assert.equal(readLibrary(s).designs.length,1);assert.equal(loadWorkspace(s).items.length,1);
  assert.throws(()=>saveWorkspace(s,{...edited,floorPlan:lockPlan({...copyPlan(restored.floorPlan),cutaway:'north'})}),/locked/);
  assert.throws(()=>saveWorkspace(s,{...edited,layoutId:'loft'}),/locked/);
  const newDesign=createCustomDesign(copyPlan(restored.floorPlan));saveWorkspace(s,newDesign);assert.equal(readLibrary(s).designs.length,2);
  assert.throws(()=>validateDesign({...edited,zoneSurfaces:{garden:'unknown'}}));assert.throws(()=>validateDesign({...edited,wallFinishes:{wall:{a:'red'}}}));
});
test('outdoor collection includes eighty distinct models and all outdoor activities',()=>{
  const outdoor=CATALOG.filter(d=>d.category==='outdoor');assert.equal(outdoor.length,80);assert.equal(new Set(outdoor.map(d=>d.id)).size,80);assert.equal(new Set(outdoor.map(d=>`${d.model}-${d.design.form}`)).size,80);
  for(const family of ['seat','shelter','boundary','plant','ground','amenity','accent','leisure'])assert.equal(outdoor.filter(d=>d.model===`outdoor-${family}`).length,10);
});
