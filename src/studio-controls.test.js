import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,BoxGeometry,Color,DirectionalLight,Group,HemisphereLight,Mesh,MeshStandardMaterial,PerspectiveCamera,Raycaster,Scene,Vector2,Vector3} from 'three';
import {DesignScene} from './scene.js';
import {frameBounds,focusViewport} from './camera-focus.js';
import {findWalkSpawn,walkBlocked,slideWalk} from './walk-navigation.js';
import {daylightState} from './lighting.js';
import {BATH_TILES,bathTileColor} from './tiles.js';
import {CATALOG,LAYOUTS,DEFAULT_DESIGN,makeItem,validateDesign} from './catalog.js';
import {createWorld,createBody} from './physics.js';
import {createModel} from './models.js';

globalThis.document={hidden:false,createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
const rect={left:0,top:0,right:900,bottom:700,width:900,height:700};
const obstacle=(min,max)=>({def:{},item:{},bounds:new Box3(new Vector3(...min),new Vector3(...max))});

test('focus frames a tall item beside the inspector and restores the original camera after successive selections',()=>{
  const camera=new PerspectiveCamera(38,900/700,.05,150);camera.position.set(10,9,12);
  const controls={target:new Vector3(0,.5,0),minDistance:3,maxDistance:28,enableDamping:true,update(){camera.lookAt(this.target);camera.updateMatrixWorld(true);}};controls.update();
  const group=new Group();group.add(new Mesh(new BoxGeometry(1.6,2.1,.4),new MeshStandardMaterial()));group.position.set(-4,1.1,.5);
  const inspector={left:25,top:210,right:285,bottom:610,width:260,height:400};
  const engine={restoreFocusWalls:()=>{},camera,controls,container:{getBoundingClientRect:()=>rect,parentElement:{querySelector:()=>({getBoundingClientRect:()=>inspector})}},objects:new Map([['shelf',{group}]]),selectedId:'shelf',view:'orbit',invalidate:()=>{}};
  const initial=camera.position.clone(),target=controls.target.clone();DesignScene.prototype.focusSelection.call(engine);
  const area=focusViewport(rect,inspector),bounds=new Box3().setFromObject(group);
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const p=new Vector3(x,y,z).project(camera),sx=(p.x+1)*450,sy=(1-p.y)*350;
    assert.ok(sx>=area.left&&sx<=area.left+area.width,`x ${sx}`);assert.ok(sy>=area.top&&sy<=area.top+area.height,`y ${sy}`);
  }
  group.position.x=3;engine.selectedId='second';engine.objects.set('second',{group});DesignScene.prototype.focusSelection.call(engine);
  DesignScene.prototype.restoreFocus.call(engine);assert.ok(camera.position.distanceTo(initial)<1e-8);assert.ok(controls.target.distanceTo(target)<1e-8);assert.equal(controls.maxDistance,28);
});

test('drop selection preserves the camera through later updates, and clicking that same selected item can focus it',()=>{
  const camera=new PerspectiveCamera(38,900/700,.05,150);camera.position.set(10,9,12);
  const controls={target:new Vector3(0,.5,0),minDistance:3,maxDistance:28,enableDamping:true,update(){camera.lookAt(this.target);camera.updateMatrixWorld(true);}};controls.update();
  const group=new Group();group.add(new Mesh(new BoxGeometry(.7,1,.7),new MeshStandardMaterial()));group.position.set(-3,.5,2);
  const engine=Object.assign(Object.create(DesignScene.prototype),{camera,controls,mode:'move',view:'orbit',container:{getBoundingClientRect:()=>rect,parentElement:{querySelector:()=>null}},objects:new Map([['dropped',{group}]]),renderer:{domElement:{style:{}}},updateSelection:()=>{},hideFocusOccluders:()=>{},invalidate:()=>{}});
  const position=camera.position.clone(),target=controls.target.clone(),rotation=camera.quaternion.clone(),fov=camera.fov;
  for(let i=0;i<3;i++)engine.select('dropped',false);
  assert.equal(engine.selectedId,'dropped');assert.ok(camera.position.equals(position));assert.ok(controls.target.equals(target));assert.ok(camera.quaternion.equals(rotation));assert.equal(camera.fov,fov);assert.equal(engine.focusOrigin,undefined);
  engine.select('dropped',true);assert.ok(camera.position.distanceTo(position)>1);assert.ok(engine.focusOrigin.position.equals(position));
  engine.select(null);assert.ok(camera.position.distanceTo(position)<1e-8);assert.ok(controls.target.equals(target));assert.equal(engine.mode,'move');
});

test('a mobile inspector outside the stage does not shrink the camera focus area',()=>{
  const canvas={left:58,top:60,width:360,height:410},inspector={left:73,right:400,top:500,bottom:800};
  assert.deepEqual(focusViewport(canvas,inspector),focusViewport(canvas,null));
  const camera=new PerspectiveCamera(38,360/410,.05,150);camera.position.set(6,5,7);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  const frame=frameBounds(camera,new Box3(new Vector3(-1,0,-1),new Vector3(1,2,1)),canvas,focusViewport(canvas,inspector));assert.ok(frame.position.toArray().every(Number.isFinite));
});

test('walls between the focused item and camera cut away temporarily and return on deselection',()=>{
  const wall=new Mesh(new BoxGeometry(4,4,.1),new MeshStandardMaterial()),other=new Mesh(new BoxGeometry(1,2,.1),wall.material);wall.position.set(0,1,2);other.position.set(8,1,2);
  const camera=new PerspectiveCamera();camera.position.set(0,1,5);const scene=new Scene();scene.add(wall,other);
  const engine=Object.assign(Object.create(DesignScene.prototype),{camera,scene,walls:[wall,other],wallVisible:true});
  engine.hideFocusOccluders(new Box3(new Vector3(-.5,0,-.5),new Vector3(.5,2,.5)));assert.equal(wall.visible,false);assert.equal(other.visible,true);engine.restoreFocusWalls();assert.equal(wall.visible,true);
  engine.focusHiddenWalls=[wall];engine.wallVisible=false;engine.restoreFocusWalls();assert.equal(wall.visible,false);
});

test('WASD in 3D view translates camera and orbit target together without moving furniture or changing height',()=>{
  const camera=new PerspectiveCamera();camera.position.set(6,6,8);const target=new Vector3(0,.5,0),initial=camera.position.clone(),offset=initial.clone().sub(target),group=new Group();
  const engine=Object.assign(Object.create(DesignScene.prototype),{view:'orbit',design:DEFAULT_DESIGN(),keys:new Set(['w']),camera,controls:{target,update:()=>{}},objects:new Map([['item',{group}]]),clock:{getDelta:()=>.05},renderer:{shadowMap:{}},composer:{render:()=>{}},frameLimit:60,lastRender:0,updateSelection:()=>{}});
  for(let i=0;i<20;i++)engine.animate();assert.ok(camera.position.distanceTo(initial)>3);assert.equal(camera.position.y,6);assert.ok(camera.position.clone().sub(target).distanceTo(offset)<1e-8);assert.deepEqual(group.position.toArray(),[0,0,0]);
  const stopped=camera.position.clone();engine.inputBlocked=true;engine.animate();assert.ok(camera.position.equals(stopped));
});

test('walkthrough finds an open entry with an exit when furniture occupies the old spawn in every layout',()=>{
  for(const layout of LAYOUTS){const preferred={x:0,z:layout.depth/2-1},objects=[obstacle([-1,0,preferred.z-.8],[1,2,preferred.z+.8])],spawn=findWalkSpawn(layout,objects,preferred);assert.ok(spawn);assert.equal(walkBlocked(layout,objects,spawn),false);assert.notDeepEqual(spawn,preferred);
    assert.ok([[.35,0],[-.35,0],[0,.35],[0,-.35]].some(([x,z])=>{const next=slideWalk(layout,objects,spawn,{x,z});return Math.hypot(next.x-spawn.x,next.z-spawn.z)>.25;}));}
});

test('walking slides along furniture and cannot tunnel through it on a long frame',()=>{
  const layout=LAYOUTS.find(l=>l.id==='loft'),objects=[obstacle([0,0,-1],[1,2,1])],next=slideWalk(layout,objects,{x:-.3,z:0},{x:.6,z:.6});
  assert.ok(next.x<-.17);assert.ok(next.z>.5);assert.equal(walkBlocked(layout,objects,next),false);
  const fast=slideWalk(layout,objects,{x:-1,z:0},{x:3,z:0});assert.ok(fast.x<0);
});

test('a completely furnished floor has an explicit escape fallback instead of a blocked spawn',()=>{
  const layout=LAYOUTS[0],objects=[obstacle([-20,0,-20],[20,2,20])];assert.equal(findWalkSpawn(layout,objects,{x:0,z:0}),null);
  const next=slideWalk(layout,objects,{x:0,z:0},{x:.5,z:0},true);assert.ok(next.x>.4);
});

test('midnight retains directional moonlight while daytime is brighter and the switch never alters celestial lighting',()=>{
  const night=daylightState(0),noon=daylightState(12);assert.ok(night.celestialIntensity>0);assert.ok(night.celestialIntensity<noon.celestialIntensity/5);assert.ok(night.environment<noon.environment/10);assert.ok(night.hemisphere<noon.hemisphere/10);assert.equal(night.fill,0);
  for(const t of [0,6,12,18,24]){const state=daylightState(t);assert.ok(state.height>0);assert.ok(Number.isFinite(state.x));}
  assert.deepEqual(daylightState(0),daylightState(24));
});

test('the light switch turns actual ceiling/placed lights and shade emission off without changing the moon',()=>{
  const layout=LAYOUTS[0],def=CATALOG.find(d=>d.id==='lamp-table'),item=makeItem(def.id,-2,1,0,.5),group=createModel(def);group.position.set(item.x,item.y,item.z);
  const o={def,item,group,signature:'lamp'},engine=Object.assign(Object.create(DesignScene.prototype),{design:{...DEFAULT_DESIGN(),time:0,lightsOn:true},graphics:{shadows:2048},objects:new Map([[item.uid,o]]),interiorLights:new Group(),scene:new Scene(),sun:new DirectionalLight(),hemi:new HemisphereLight(),fill:new DirectionalLight(),renderer:{},invalidate:()=>{}});
  engine.scene.background=new Color();engine.prepareLampMaterials(o);engine.syncInteriorLights(layout);engine.setTime(0);assert.ok(o.glowMaterials.length);assert.ok(o.glowMaterials.every(m=>m.emissiveIntensity>0));assert.equal(engine.interiorLights.visible,true);assert.equal(engine.installedLights.filter(l=>l.castShadow).length,2);
  const moon=engine.sun.intensity,position=engine.sun.position.clone();engine.design.lightsOn=false;engine.syncInteriorLights(layout);engine.setTime(0);assert.equal(engine.interiorLights.visible,false);assert.ok(o.glowMaterials.every(m=>m.emissiveIntensity===0));assert.equal(engine.sun.intensity,moon);assert.ok(engine.sun.position.equals(position));
  engine.graphics.shadows=0;engine.syncLightShadows();assert.ok(engine.installedLights.every(l=>!l.castShadow));
});

test('switch state and all tile presets/custom colors survive portable saves; older saves keep their existing tiles',()=>{
  assert.equal(BATH_TILES.length,24);assert.equal(new Set(BATH_TILES.map(t=>t.color)).size,24);
  for(const tile of [...BATH_TILES.map(t=>t.id),'#1234ab']){const result=validateDesign(JSON.parse(JSON.stringify({...DEFAULT_DESIGN(),lightsOn:false,bathTile:tile})));assert.equal(result.lightsOn,false);assert.equal(result.bathTile,tile);assert.match(bathTileColor(tile),/^#[\da-f]{6}$/i);}
  const legacy=DEFAULT_DESIGN();delete legacy.lightsOn;assert.equal(validateDesign(legacy).lightsOn,true);assert.equal(validateDesign({...legacy,bathTile:'terracotta'}).bathTile,'terracotta');assert.throws(()=>validateDesign({...legacy,lightsOn:'false'}));
});

test('catalog dragging previews a requested floor position, rejects overlap, and cancels without adding an item',()=>{
  const camera=new PerspectiveCamera(38,900/700,.05,150);camera.position.set(7,8,10);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  const engine=Object.assign(Object.create(DesignScene.prototype),{scene:new Scene(),keys:new Set(),camera,raycaster:new Raycaster(),pointer:new Vector2(),container:{getBoundingClientRect:()=>rect},renderer:{domElement:{getBoundingClientRect:()=>rect}},design:{...DEFAULT_DESIGN(),items:[]},objects:new Map(),world:createWorld(10,8),snap:true});
  const def=CATALOG.find(d=>d.id==='chair-wood'),eventFor=position=>{const p=new Vector3(...position).project(camera);return {clientX:(p.x+1)*450,clientY:(1-p.y)*350};};
  engine.beginCatalogDrag(def);const valid=engine.updateCatalogDrag(eventFor([-2,0,1]));assert.ok(valid.valid);assert.equal(valid.x,-2);assert.equal(valid.z,1);assert.equal(engine.design.items.length,0);
  const occupied=createBody(def,makeItem(def.id,-2,1));engine.world.addBody(occupied);assert.equal(engine.updateCatalogDrag(eventFor([-2,0,1])).valid,false);
  assert.equal(engine.updateCatalogDrag({clientX:-10,clientY:300}),null);assert.equal(engine.catalogPreview.group.visible,false);engine.cancelCatalogDrag();assert.equal(engine.catalogPreview,null);assert.equal(engine.scene.children.length,0);assert.equal(engine.design.items.length,0);
});

test('a small catalog item can be dropped directly onto a fitted kitchen countertop',()=>{
  const camera=new PerspectiveCamera(38,900/700,.05,150);camera.position.set(3,4,5);camera.lookAt(0,.5,0);camera.updateMatrixWorld(true);
  const def=CATALOG.find(d=>d.id==='design-kitchen-farmhouse-sink'),group=createModel(def),item=makeItem(def.id);group.updateMatrixWorld(true);
  let top=0;group.traverse(mesh=>{if(mesh.isMesh&&mesh.userData.surface?.id==='top')top=Math.max(top,new Box3().setFromObject(mesh).max.y);});
  const engine=Object.assign(Object.create(DesignScene.prototype),{scene:new Scene(),keys:new Set(),camera,raycaster:new Raycaster(),pointer:new Vector2(),container:{getBoundingClientRect:()=>rect},renderer:{domElement:{getBoundingClientRect:()=>rect}},design:{...DEFAULT_DESIGN(),items:[item]},objects:new Map([[item.uid,{def,item,group}]]),world:createWorld(10,8),snap:true});
  engine.world.addBody(createBody(def,item,group.userData.collisionBoxes));engine.beginCatalogDrag(CATALOG.find(d=>d.id==='vase'));
  const p=new Vector3(-def.size[0]*.42,top,.12).project(camera),drop=engine.updateCatalogDrag({clientX:(p.x+1)*450,clientY:(1-p.y)*350});assert.ok(drop.valid);assert.ok(Math.abs(drop.y-top)<.012);engine.cancelCatalogDrag();
});
