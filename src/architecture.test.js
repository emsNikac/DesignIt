import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {CATALOG,makeItem,DEFAULT_DESIGN,validateDesign,FLOOR_TYPES} from './catalog.js';
import {createModel,makeTexture} from './models.js';
import {createBody,createWorld,canPlaceBody} from './physics.js';
import {itemDefinition,blocksWallWalk,WALL_ITEMS,fitWallDimensions} from './architecture.js';
import {floorTextureType,floorSurface} from './floors.js';
globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};

test('resized walls keep their visual dimensions, collision dimensions and saved data',()=>{
  const def=WALL_ITEMS[1],item=makeItem(def.id,0,0,0,0,{dimensions:[3.4,2.6,.22]});
  const model=createModel(itemDefinition(def,item)),bounds=new Box3().setFromObject(model),size=bounds.getSize(new Vector3());
  for(let i=0;i<3;i++)assert.ok(Math.abs(size.getComponent(i)-item.dimensions[i])<.001);
  const body=createBody(def,item);body.updateAABB();assert.ok(Math.abs(body.aabb.upperBound.x-body.aabb.lowerBound.x-3.4)<.001);
  const design=DEFAULT_DESIGN();design.items=[item];assert.deepEqual(validateDesign(JSON.parse(JSON.stringify(design))).items[0].dimensions,item.dimensions);
  design.items[0].dimensions[0]=100;assert.throws(()=>validateDesign(design));
});
test('doorways allow walking and small objects through the opening but block their panels',()=>{
  const def=CATALOG.find(d=>d.id==='wall-doorway'),item=makeItem(def.id),wall=createBody(def,item),world=createWorld(10,8);world.addBody(wall);
  assert.equal(blocksWallWalk(def,item,{x:0,z:0}),false);assert.equal(blocksWallWalk(def,item,{x:.9,z:0}),true);
  const prop=createBody(CATALOG.find(d=>d.id==='vase'),makeItem('vase',0,0,0,.1));
  assert.equal(canPlaceBody(world,prop,[wall]),true);prop.position.x=.9;prop.aabbNeedsUpdate=true;assert.equal(canPlaceBody(world,prop,[wall]),false);
  item.rotation=Math.PI/2;assert.equal(blocksWallWalk(def,item,{x:0,z:0}),false);assert.equal(blocksWallWalk(def,item,{x:0,z:.9}),true);
});
test('added floors have unique IDs, renderable textures and valid portable designs',()=>{
  assert.equal(FLOOR_TYPES.length,18);assert.equal(new Set(FLOOR_TYPES.map(f=>f.id)).size,18);
  for(const floor of FLOOR_TYPES){assert.ok(makeTexture(floorTextureType(floor),floor.color).isTexture);assert.ok(floorSurface(floor).roughness>0);const d=DEFAULT_DESIGN();d.floor=floor.id;assert.equal(validateDesign(d).floor,floor.id);}
});
test('wall length stays within a compact room after resizing and rotating',()=>{
  const layout={width:7,depth:6};
  for(const rotation of [0,Math.PI/4,Math.PI/2]){
    const dimensions=fitWallDimensions([8,2.9,.2],{rotation,scale:1},layout),c=Math.abs(Math.cos(rotation)),s=Math.abs(Math.sin(rotation));
    assert.ok(dimensions[0]*c+dimensions[2]*s<=layout.width-.199);
    assert.ok(dimensions[0]*s+dimensions[2]*c<=layout.depth-.199);
  }
});
