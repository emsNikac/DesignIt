import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Group,Plane,Vector3} from 'three';
import {DesignScene} from './scene.js';

function fixture(mode='navigate',hit=true){
  const selected=[],group=new Group();group.position.set(1,0,2);
  const engine={view:'orbit',mode,objects:new Map([['item',{group}]]),controls:{enabled:true},renderer:{domElement:{style:{}}},callbacks:{onSelect:uid=>selected.push(uid),onPartSelect:()=>{}},ray:()=>{},updateSelection:()=>{},invalidate:()=>{},dragPlane:new Plane(),
    raycaster:{intersectObjects:()=>hit?[{object:{userData:{uid:'item',surface:{id:'body'}}}}]:[],ray:{intersectPlane:(_,target)=>target.set(0,0,0)}},
    restoreFocus:()=>{},focusSelection:()=>{},setMode:DesignScene.prototype.setMode,select:DesignScene.prototype.select};
  const event={button:0,pointerId:1,clientX:100,clientY:100,stopImmediatePropagation:()=>{}};
  return {engine,event,selected,group};
}
test('a navigation drag beginning over furniture keeps navigating without selecting or moving it',()=>{
  const {engine,event,selected,group}=fixture();DesignScene.prototype.pointerDown.call(engine,event);
  assert.equal(engine.controls.enabled,true);assert.equal(engine.pendingDrag,undefined);
  DesignScene.prototype.pointerMove.call(engine,{...event,clientX:130});DesignScene.prototype.pointerUp.call(engine,{...event,clientX:130});
  assert.deepEqual(selected,[]);assert.equal(engine.mode,'navigate');assert.deepEqual(group.position.toArray(),[1,0,2]);
});
test('a click selects furniture and clicking empty space returns to navigation',()=>{
  const {engine,event,selected}=fixture();DesignScene.prototype.pointerDown.call(engine,event);DesignScene.prototype.pointerUp.call(engine,event);
  assert.deepEqual(selected,['item']);assert.equal(engine.mode,'select');
  engine.raycaster.intersectObjects=()=>[];DesignScene.prototype.pointerDown.call(engine,event);DesignScene.prototype.pointerUp.call(engine,event);
  assert.deepEqual(selected,['item',null]);assert.equal(engine.mode,'navigate');
});
test('only the move tool starts a furniture drag',()=>{
  const {engine,event}=fixture('move');DesignScene.prototype.pointerDown.call(engine,event);
  assert.equal(engine.pendingDrag.uid,'item');assert.equal(engine.controls.enabled,false);assert.equal(engine.mode,'move');
});
test('a canceled navigation gesture cannot select an object on blur',()=>{
  const {engine,event,selected}=fixture();DesignScene.prototype.pointerDown.call(engine,event);DesignScene.prototype.pointerUp.call(engine);
  assert.deepEqual(selected,[]);
});

test('deselecting in Move mode keeps Move active until navigation is chosen',()=>{
  const {engine,event,selected}=fixture('move',false);DesignScene.prototype.pointerDown.call(engine,event);DesignScene.prototype.pointerUp.call(engine,event);
  assert.deepEqual(selected,[null]);assert.equal(engine.mode,'move');engine.select('item');engine.select(null);assert.equal(engine.mode,'move');engine.setMode('navigate');assert.equal(engine.mode,'navigate');
});

test('Move requests camera focus for a completed click, while a drag keeps the current view',()=>{
  const click=fixture('move'),clickSelections=[];click.engine.callbacks.onSelect=(uid,focus)=>clickSelections.push({uid,focus});
  DesignScene.prototype.pointerDown.call(click.engine,click.event);assert.deepEqual(clickSelections,[{uid:'item',focus:false}]);
  DesignScene.prototype.pointerUp.call(click.engine,click.event);assert.deepEqual(clickSelections,[{uid:'item',focus:false},{uid:'item',focus:true}]);
  const drag=fixture('move'),dragSelections=[];drag.engine.callbacks.onSelect=(uid,focus)=>dragSelections.push({uid,focus});drag.engine.callbacks.onMove=()=>{};drag.engine.objects.get('item').def={small:false};
  DesignScene.prototype.pointerDown.call(drag.engine,drag.event);drag.engine.dragging=drag.engine.pendingDrag;drag.group.position.x+=.4;
  DesignScene.prototype.pointerUp.call(drag.engine,{...drag.event,clientX:150});assert.deepEqual(dragSelections,[{uid:'item',focus:false}]);
});
