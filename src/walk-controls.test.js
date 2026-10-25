import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyMouseLook,walkingDirection} from './walk-controls.js';
import {DesignScene} from './scene.js';

test('free mouse movement updates both yaw and pitch',()=>{const r=applyMouseLook({yaw:0,pitch:0},100,50);assert.ok(r.yaw<0);assert.ok(r.pitch<0);});
test('looking up and down cannot flip the camera',()=>{for(const delta of [-100000,100000]){const r=applyMouseLook({yaw:0,pitch:0},0,delta);assert.ok(Math.abs(r.pitch)<Math.PI/2);}});
test('diagonal movement is no faster than straight movement',()=>{const a=walkingDirection(new Set(['w']),0),b=walkingDirection(new Set(['w','d']),0);assert.ok(Math.abs(Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))<1e-10);});
test('walking follows yaw and has no vertical component',()=>{const r=walkingDirection(new Set(['w']),Math.PI/2);assert.ok(Math.abs(r.x+1)<1e-10);assert.ok(Math.abs(r.z)<1e-10);assert.equal(r.y,undefined);});
test('fallback mouse-look does not require holding a mouse button',()=>{
  const canvas={},movements=[],engine={view:'walk',lookState:'soft',renderer:{domElement:canvas},lookAround:(x,y)=>movements.push([x,y])};
  DesignScene.prototype.pointerMove.call(engine,{target:canvas,pointerType:'mouse',movementX:12,movementY:-8,buttons:0});
  assert.deepEqual(movements,[[12,-8]]);
});
test('releasing the mouse clears movement keys and pauses exploration',()=>{
  const original=globalThis.document,canvas={};let released=false,state;
  globalThis.document={pointerLockElement:canvas,exitPointerLock:()=>{released=true;}};
  try{const engine={keys:new Set(['w','shift']),renderer:{domElement:canvas},setLookState:value=>{state=value;}};
    DesignScene.prototype.releaseMouse.call(engine);assert.equal(engine.keys.size,0);assert.equal(released,true);assert.equal(state,'paused');
  }finally{if(original===undefined)delete globalThis.document;else globalThis.document=original;}
});
