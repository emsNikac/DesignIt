import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createModel, material, makeTexture, primitives } from './models.js';
import { disposeOwnedGeometry } from './mesh-optimizer.js';
import { appearanceKey } from './appearance.js';
import {DEFAULT_GRAPHICS,normalizeGraphics} from './graphics.js';
import {createAntialiasing} from './antialiasing.js';
import {itemDefinition} from './architecture.js';
import {floorSurface,floorTextureType} from './floors.js';
import { CATALOG, LAYOUTS, FLOOR_TYPES, makeItem } from './catalog.js';
import {itemElevation} from './placement.js';
import { createWorld, createBody, canPlaceBody } from './physics.js';
import { applyMouseLook, walkingDirection } from './walk-controls.js';
import {focusViewport,frameBounds} from './camera-focus.js';
import {walkBlocked,findWalkSpawn,slideWalk} from './walk-navigation.js';
import {daylightState,roomLightPositions} from './lighting.js';
import {bathTileColor} from './tiles.js';

const {box,cyl}=primitives;
export class DesignScene {
  constructor(container, callbacks, graphics=DEFAULT_GRAPHICS) {
    this.container=container;this.callbacks=callbacks;this.objects=new Map();this.keys=new Set();this.mode='navigate';this.view='orbit';this.snap=true;this.wallVisible=true;this.disposed=false;this.dirty=true;this.shadowDirty=true;this.lastRender=0;this.frameLimit=60;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#eeeee7');
    this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:false,powerPreference:'high-performance'});
    try{
    this.graphics=normalizeGraphics(graphics);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.graphics.pixelRatio));this.renderer.shadowMap.enabled=this.graphics.shadows>0;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.camera=new THREE.PerspectiveCamera(38,1,.05,150);this.camera.position.set(12,11,14);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,.5,0);this.controls.enableDamping=true;this.controls.dampingFactor=.09;this.controls.minDistance=3;this.controls.maxDistance=28;this.controls.maxPolarAngle=Math.PI*.48;this.controls.minPolarAngle=.05;
    this.controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
    this.hemi=new THREE.HemisphereLight('#fff8e8','#a19b83',2.2);this.scene.add(this.hemi);
    this.sun=new THREE.DirectionalLight('#fff3d7',4.5);this.sun.position.set(-4,8,-6);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.camera.left=-11;this.sun.shadow.camera.right=11;this.sun.shadow.camera.top=11;this.sun.shadow.camera.bottom=-11;this.sun.shadow.camera.near=.5;this.sun.shadow.camera.far=40;this.sun.shadow.normalBias=.025;this.sun.shadow.bias=-.00008;this.sun.shadow.radius=3;this.scene.add(this.sun);this.scene.add(this.sun.target);
    this.fill=new THREE.DirectionalLight('#eef0dd',.55);this.fill.position.set(5,6,7);this.scene.add(this.fill);
    this.interiorLights=new THREE.Group();this.scene.add(this.interiorLights);
    this.rebuildEnvironment();this.scene.environmentIntensity=.55;
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#eaeae3',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.27;ground.receiveShadow=true;this.scene.add(ground);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.dragPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);this.dragPoint=new THREE.Vector3();
    this.selection=new THREE.Box3Helper(new THREE.Box3(), '#7d9364');this.selection.visible=false;this.scene.add(this.selection);
    this.grid=new THREE.GridHelper(30,60,'#999f86','#c7cbbb');this.grid.position.y=.008;this.grid.visible=false;this.grid.material.transparent=true;this.grid.material.opacity=.24;this.scene.add(this.grid);
    this.composer=new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene,this.camera));
    this.ao=null;this.antialiasPass=null;this.outputPass=new OutputPass();this.composer.addPass(this.outputPass);
    this.applyGraphics(this.graphics);
    this.bindings=[];this.listen(this.controls,'change',()=>this.invalidate());
    this.listen(this.renderer.domElement,'webglcontextlost',event=>{event.preventDefault();this.contextLost=true;this.releaseMouse();this.pointerUp();this.renderer.domElement.dataset.renderState='lost';this.callbacks.onRenderStatus?.('lost');});
    this.listen(this.renderer.domElement,'webglcontextrestored',()=>this.restoreContext());
    this.renderer.domElement.dataset.renderState='ready';
    this.walkLook={yaw:0,pitch:0};this.lookState='paused';
    this.listen(document,'pointerlockchange',()=>{
      const locked=document.pointerLockElement===this.renderer.domElement;
      this.keys.clear();this.setLookState(locked?'locked':'paused');
      if(locked&&this.view!=='walk')this.releaseMouse();
    });
    this.listen(document,'pointerlockerror',()=>{if(this.view==='walk')this.setLookState('fallback');});
    this.listen(document,'mousemove',e=>{if(this.view==='walk'&&document.pointerLockElement===this.renderer.domElement)this.lookAround(e.movementX,e.movementY);});
    this.listen(this.renderer.domElement,'pointerdown',this.pointerDown.bind(this),true);
    this.listen(window,'pointermove',this.pointerMove.bind(this));this.listen(window,'pointerup',this.pointerUp.bind(this));this.listen(window,'pointercancel',()=>this.pointerUp());
    this.listen(window,'keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;if(this.inputBlocked||e.metaKey||e.ctrlKey||e.altKey)return;if((this.view==='walk'&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))||(this.view==='orbit'&&['w','a','s','d'].includes(e.key.toLowerCase())))e.preventDefault();this.keys.add(e.key.toLowerCase());});this.listen(window,'keyup',e=>this.keys.delete(e.key.toLowerCase()));this.listen(window,'blur',()=>{this.releaseMouse();this.pointerUp();});
    this.listen(document,'visibilitychange',()=>{if(document.hidden)this.releaseMouse();});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
    this.clock=new THREE.Clock();this.renderer.setAnimationLoop(()=>this.animate());
    }catch(error){this.dispose();throw error;}
  }
  listen(target,event,fn,options){target.addEventListener(event,fn,options);this.bindings.push(()=>target.removeEventListener(event,fn,options));}
  rebuildEnvironment(){const pmrem=new THREE.PMREMGenerator(this.renderer),env=new RoomEnvironment();this.envTarget?.dispose();this.envTarget=pmrem.fromScene(env,.04);this.scene.environment=this.envTarget.texture;env.dispose();pmrem.dispose();}
  restoreContext(){
    if(this.disposed)return;
    try{this.rebuildEnvironment();this.sun.shadow.map?.dispose();this.sun.shadow.map=null;this.composer.reset();this.contextLost=false;this.renderFailed=false;this.applyGraphics(this.graphics);this.clock.getDelta();this.renderer.domElement.dataset.renderState='ready';this.callbacks.onRenderStatus?.('ready');this.invalidate(true);}
    catch(error){this.renderFailed=true;this.callbacks.onRenderStatus?.('failed');console.error('Could not restore the 3D renderer.',error);}
  }
  invalidate(shadows=false){this.dirty=true;this.shadowDirty=this.shadowDirty||shadows;}
  applyGraphics(value){
    this.graphics=normalizeGraphics(value);const settings=this.graphics;
    this.frameLimit=settings.fps;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,settings.pixelRatio));this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.renderer.shadowMap.enabled=settings.shadows>0;
    if(!settings.shadows){this.sun.shadow.map?.dispose();this.sun.shadow.map=null;}
    if(this.sun.shadow.mapSize.x!==settings.shadows&&settings.shadows){this.sun.shadow.map?.dispose();this.sun.shadow.map=null;this.sun.shadow.mapSize.set(settings.shadows,settings.shadows);}
    if(settings.ao&&!this.ao){this.ao=new GTAOPass(this.scene,this.camera,512,512);this.ao.blendIntensity=.85;this.composer.insertPass(this.ao,1);}
    if(!settings.ao&&this.ao){this.composer.removePass(this.ao);this.ao.dispose();this.ao=null;}
    this.ao?.updateGtaoMaterial({radius:.32,distanceExponent:1.5,thickness:.7,samples:settings.aoSamples});
    if(this.antialiasMode!==settings.antialias){
      if(this.antialiasPass){this.composer.removePass(this.antialiasPass);this.antialiasPass.dispose();}
      this.antialiasMode=settings.antialias;this.antialiasPass=createAntialiasing(settings.antialias,()=>this.invalidate());
      if(this.antialiasPass){const outputIndex=this.composer.passes.indexOf(this.outputPass);this.composer.insertPass(this.antialiasPass,outputIndex+(settings.antialias==='fxaa'?1:0));}
    }
    this.syncLightShadows();this.resize();this.invalidate(true);
  }
  getAppearanceParts(uid){return this.objects.get(uid)?.group.userData.appearanceParts||[];}
  resize(){const{width,height}=this.container.getBoundingClientRect();if(!width||!height)return;this.renderer.setSize(width,height);this.composer?.setSize(width,height);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();if(this.focusOrigin&&this.objects.has(this.selectedId))this.focusSelection(true);this.invalidate();}
  buildRoom(layout,wallColor,floorType,bathTile){
    if(this.room){this.scene.remove(this.room);disposeOwnedGeometry(this.room);}
    this.room=new THREE.Group();this.scene.add(this.room);this.walls=[];
    const{width:w,depth:d}=layout;
    const slab=material('#c9c3b4');box(this.room,w+.26,.23,d+.26,0,-.13,0,slab,.035);
    const f=FLOOR_TYPES.find(f=>f.id===floorType)||FLOOR_TYPES[0];const texture=makeTexture(floorTextureType(f),f.color);
    const floortex=texture.clone();floortex.repeat.set(w/5,d/5);floortex.needsUpdate=true;
    const floorMat=new THREE.MeshStandardMaterial({map:floortex,bumpMap:floortex,...floorSurface(f)});
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(w,d),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=.002;floor.userData.ownedMaterial=true;this.room.add(floor);
    const wall=material(wallColor),trim=material('#eeeade');
    const addWall=(width,height,depth,x,y,z)=>{const m=box(this.room,width,height,depth,x,y,z,wall,.008);this.walls.push(m);return m;};
    addWall(.16,3.1,d,-w/2,1.55,0);
    const winW=w*.52,winX=-w*.12,winY=1.8,winH=1.85;
    addWall(w,.83,.16,0,.415,-d/2);
    addWall(w,.44,.16,0,2.88,-d/2);
    const leftEnd=winX-winW/2,rightStart=winX+winW/2;
    addWall(leftEnd+w/2,1.85,.16,(-w/2+leftEnd)/2,1.755,-d/2);
    addWall(w/2-rightStart,1.85,.16,(rightStart+w/2)/2,1.755,-d/2);
    const windowGroup=new THREE.Group();this.room.add(windowGroup);this.walls.push(windowGroup);
    box(windowGroup,winW+.12,.055,.27,winX,.83,-d/2+.03,material('#d0c8b5'),.01);
    box(windowGroup,winW,winH,.012,winX,winY-.045,-d/2,material('#a6b8b1','glass'),0);
    const frame=material('#60645a','metal');
    for(let i=0;i<5;i++)box(windowGroup,.035,winH,.06,winX-winW/2+i*winW/4,winY-.045,-d/2+.04,frame,.004);
    for(const y of [.84,1.94,2.68])box(windowGroup,winW,.032,.06,winX,y,-d/2+.04,frame,.004);
    const outside=new THREE.Group();this.room.add(outside);this.walls.push(outside);
    this.outsideMaterial=new THREE.MeshBasicMaterial({color:'#d8dfd3'});
    const sky=box(outside,winW+.1,winH,.015,winX,winY-.045,-d/2-.18,this.outsideMaterial,0);sky.userData.ownedMaterial=true;sky.castShadow=false;
    for(let i=0;i<18;i++){const h=.15+(Math.sin(i*4.9)+1)*.16;box(outside,.35,h,.02,winX-winW/2+i*winW/18,.87+h/2,-d/2-.15,material(i%3?'#b6c2b0':'#a5b49f'),0);}
    outside.traverse(o=>{o.castShadow=false;});windowGroup.traverse(o=>{if(o.material?.transparent)o.castShadow=false;});
    const trim1=box(this.room,.045,.1,d,-w/2+.1,.05,0,trim,.005),trim2=box(this.room,w,.1,.045,0,.05,-d/2+.1,trim,.005);this.walls.push(trim1,trim2);
    // Complete the envelope when a player steps inside. The orbit camera uses
    // a cutaway so these near walls never hide the room being designed.
    this.walkEnvelope=new THREE.Group();this.room.add(this.walkEnvelope);
    box(this.walkEnvelope,w,3.1,.16,0,1.55,d/2,wall,.008);
    box(this.walkEnvelope,.16,.83,d,w/2,.415,0,wall,.008);
    box(this.walkEnvelope,.16,.44,d,w/2,2.88,0,wall,.008);
    for(const z of [-d/2,d/2])box(this.walkEnvelope,.16,1.85,.6,w/2,1.755,z+(z>0?-.3:.3),wall,.008);
    box(this.walkEnvelope,.012,winH,d-1.2,w/2,1.755,0,material('#a6b8b1','glass'),0);
    for(let i=0;i<5;i++)box(this.walkEnvelope,.06,winH,.035,w/2-.04,1.755,-d/2+.6+i*(d-1.2)/4,frame,.004);
    box(this.walkEnvelope,w,.08,d,0,3.14,0,trim,.008);
    this.ceilingMaterials=[];for(const [x,y,z] of roomLightPositions(layout)){const m=new THREE.MeshStandardMaterial({color:'#eee8d6',emissive:'#ffe2b5',emissiveIntensity:this.design?.lightsOn===false?0:.6});this.ceilingMaterials.push(m);const fixture=cyl(this.walkEnvelope,.16,.16,.025,x,y+.14,z,m);fixture.userData.ownedMaterial=true;}
    this.walkEnvelope.traverse(o=>{if(o.material?.transparent)o.castShadow=false;});
    this.walkEnvelope.visible=this.wallVisible&&this.view==='walk';
    if(layout.partitions){
      addWall(.14,2.9,d*.42,1.45,1.45,-d*.29);addWall(.14,2.9,d*.18,1.45,1.45,d*.41);
      addWall(w/2-1.45,2.9,.14,(1.45+w/2)/2,1.45,.45);
      const tc=bathTileColor(bathTile);
      const tm=new THREE.MeshStandardMaterial({map:makeTexture('tile',tc),roughness:.3});
      const t=new THREE.Mesh(new THREE.PlaneGeometry(w/2-1.54,d/2-.5),tm);t.rotation.x=-Math.PI/2;t.position.set((1.54+w/2)/2,.008,(d/2+.5)/2);t.receiveShadow=true;t.userData.ownedMaterial=true;this.room.add(t);
      const tiledWall=box(this.room,w/2-1.54,1.3,.025,(1.54+w/2)/2,.65,.54,tm,.005);this.walls.push(tiledWall);
    }
    // Architectural details give scale without making the room harder to edit.
    for(const z of [-d*.3,d*.3]){const outlet=box(this.room,.015,.09,.065,-w/2+.1,.3,z,trim,.007);this.walls.push(outlet);}
    this.setWalls(this.wallVisible);
  }
  setDesign(design){
    const old=this.design;this.design=design;
    const layout=LAYOUTS.find(l=>l.id===design.layoutId);
    const mapChanged=!old||old.layoutId!==design.layoutId;
    if(mapChanged){this.focusOrigin=null;this.focusedId=null;this.cancelCatalogDrag();this.world=createWorld(layout.width,layout.depth,layout.partitions);for(const obj of this.objects.values()){this.scene.remove(obj.group);disposeOwnedGeometry(obj.group);obj.glowMaterials?.forEach(m=>m.dispose());}this.objects.clear();}
    if(mapChanged||old.wallColor!==design.wallColor||old.floor!==design.floor||old.bathTile!==design.bathTile)this.buildRoom(layout,design.wallColor,design.floor,design.bathTile);
    if(mapChanged){this.controls.target.set(0,.5,0);this.setView('orbit');this.callbacks.onView?.('orbit');}
    let supportMoved=false;
    const wanted=new Set(design.items.map(i=>i.uid));
    for(const[id,o]of this.objects)if(!wanted.has(id)){if(!o.def.small)supportMoved=true;this.removeObject(o);this.objects.delete(id);}
    for(const item of design.items){
      const def=itemDefinition(CATALOG.find(c=>c.id===item.catalogId),item);let o=this.objects.get(item.uid);
      const shapeSignature=JSON.stringify([item.catalogId,item.scale,item.dimensions]);
      const signature=`${shapeSignature}-${appearanceKey(item)}`;
      const makeGroup=()=>{const group=createModel(def,item.color,item.appearance,item.pattern);group.scale.setScalar(item.scale);group.userData.uid=item.uid;group.traverse(child=>child.userData.uid=item.uid);return group;};
      if(o&&o.signature!==signature){
        if(o.shapeSignature===shapeSignature){
          const oldGroup=o.group,group=makeGroup();group.position.copy(oldGroup.position);group.quaternion.copy(oldGroup.quaternion);
          this.scene.remove(oldGroup);disposeOwnedGeometry(oldGroup);o.glowMaterials?.forEach(m=>m.dispose());this.scene.add(group);o.group=group;o.signature=signature;this.prepareLampMaterials(o);
        }else{this.removeObject(o);this.objects.delete(item.uid);o=null;}
      }
      if(!o){
        const group=makeGroup();this.scene.add(group);
        const body=createBody(def,item,group.userData.collisionBoxes);if(body){this.world.addBody(body);if(def.small){body.addEventListener('sleep',()=>{if(this.dragging?.uid===item.uid)return;const current=this.objects.get(item.uid);if(!current)return;const y=Math.max(0,body.position.y);if(Math.abs(current.item.y-y)>.025||Math.abs(current.item.x-body.position.x)>.025||Math.abs(current.item.z-body.position.z)>.025)this.callbacks.onPhysics?.(item.uid,{x:body.position.x,y,z:body.position.z});});}}
        o={group,body,signature,shapeSignature,item,def};this.prepareLampMaterials(o);this.objects.set(item.uid,o);
      }
      if(this.dragging?.uid!==item.uid){
        const changed=!o.last||['x','y','z','rotation'].some(k=>o.last[k]!==item[k]);
        if(changed){if(!o.def.small)supportMoved=true;o.group.position.set(item.x,item.y,item.z);o.group.rotation.set(0,item.rotation,0);if(o.body){o.body.position.set(item.x,item.y,item.z);o.body.quaternion.setFromEuler(0,item.rotation,0);o.body.velocity.setZero();o.body.angularVelocity.setZero();o.body.aabbNeedsUpdate=true;if(o.def.small)o.body.wakeUp();}}
      }
      o.item=item;o.last={...item};o.bounds=new THREE.Box3().setFromObject(o.group);
    }
    if(supportMoved)for(const o of this.objects.values())if(o.def.small)o.body?.wakeUp();
    this.syncInteriorLights(layout);
    if(!old||old.time!==design.time||old.lightsOn!==design.lightsOn||mapChanged||old.wallColor!==design.wallColor||old.floor!==design.floor||old.bathTile!==design.bathTile)this.setTime(design.time);
    if(this.view==='walk'&&walkBlocked(layout,[...this.objects.values()],this.camera.position))this.ensureWalkPosition();
    if(this.focusOrigin&&this.objects.has(this.selectedId))this.hideFocusOccluders(new THREE.Box3().setFromObject(this.objects.get(this.selectedId).group));
    this.updateSelection();this.invalidate(true);
  }
  removeObject(o){o.glowMaterials?.forEach(m=>m.dispose());this.scene.remove(o.group);if(o.body)this.world.removeBody(o.body);disposeOwnedGeometry(o.group);this.invalidate(true);}
  prepareLampMaterials(o){
    o.glowMaterials=[];if(o.def.category!=='lighting')return;
    const copies=new Map();o.group.traverse(mesh=>{if(!mesh.isMesh||Array.isArray(mesh.material)||!mesh.material.emissiveIntensity)return;const source=mesh.material;if(!copies.has(source)){const m=source.clone();m.userData.baseGlow=source.emissiveIntensity;copies.set(source,m);o.glowMaterials.push(m);}mesh.material=copies.get(source);mesh.material.emissiveIntensity=this.design.lightsOn===false?0:mesh.material.userData.baseGlow;});
  }
  syncLightShadows(){
    const limit=this.graphics.shadows>=1024?2:0;
    (this.installedLights||[]).forEach((light,index)=>{light.castShadow=index<limit;if(!light.castShadow){light.shadow.map?.dispose();light.shadow.map=null;}});
  }
  syncInteriorLights(layout){
    const fixtures=[...this.objects.values()].filter(o=>o.def.category==='lighting');
    const signature=JSON.stringify([layout.id,...fixtures.map(o=>[o.item.uid,o.signature,o.item.x,o.item.y,o.item.z,o.item.rotation])]);
    if(signature!==this.lightSignature){
      this.lightSignature=signature;this.interiorLights.traverse(o=>o.shadow?.dispose());this.interiorLights.clear();this.installedLights=[];
      for(const [x,y,z] of roomLightPositions(layout)){
        const light=new THREE.SpotLight('#ffe5bd',65,18,Math.PI*.43,.72,2);light.position.set(x,y,z);light.target.position.set(x,0,z);light.shadow.mapSize.set(512,512);light.shadow.bias=-.0003;light.shadow.normalBias=.035;light.shadow.camera.near=.1;this.interiorLights.add(light,light.target);this.installedLights.push(light);
      }
      for(const o of fixtures.slice(0,8)){
        o.group.updateMatrixWorld(true);const shades=new THREE.Box3();o.group.traverse(mesh=>{if(mesh.isMesh&&mesh.userData.surface?.id==='shade')shades.union(new THREE.Box3().setFromObject(mesh));});
        const point=shades.isEmpty()?new THREE.Vector3(o.item.x,o.item.y+o.def.size[1]*o.item.scale*.75,o.item.z):shades.getCenter(new THREE.Vector3());
        const light=new THREE.PointLight('#ffdfa8',o.def.ceiling?9:6,5.5,2);light.position.copy(point);this.interiorLights.add(light);
      }
      this.syncLightShadows();
    }
    const on=this.design.lightsOn!==false;this.interiorLights.visible=on;
    for(const o of fixtures)for(const m of o.glowMaterials||[])m.emissiveIntensity=on?m.userData.baseGlow:0;
    for(const m of this.ceilingMaterials||[])m.emissiveIntensity=on?.6:0;
  }
  setTime(time){
    const state=daylightState(time),layout=LAYOUTS.find(l=>l.id===this.design.layoutId),on=this.design.lightsOn!==false;
    this.sun.position.set(state.x,state.height,-layout.depth/2-7);this.sun.target.position.set(-layout.width*.08,.5,0);
    this.sun.intensity=state.celestialIntensity;this.sun.color.set(state.celestialColor);
    this.hemi.intensity=state.hemisphere+(on?.08:0);this.hemi.color.set(state.day>.2?'#fff5df':'#7d93bd');
    this.fill.intensity=state.fill;this.fill.color.set('#eef0dd');this.outsideMaterial?.color.set(state.sky);
    this.scene.environmentIntensity=state.environment+(on?.05:0);this.renderer.toneMappingExposure=.9;
    this.scene.background.set(state.background);this.invalidate(true);
  }
  setWalls(show){this.wallVisible=show;for(const w of this.walls||[])w.visible=show;if(this.walkEnvelope)this.walkEnvelope.visible=show&&this.view==='walk';if(this.focusOrigin&&this.objects.has(this.selectedId))this.hideFocusOccluders(new THREE.Box3().setFromObject(this.objects.get(this.selectedId).group));this.invalidate(true);}
  setMode(mode){this.mode=mode;this.renderer.domElement.style.cursor=mode==='navigate'||mode==='move'?'grab':'default';}
  setGrid(show){this.gridState=show;this.grid.visible=show;this.invalidate();}
  setSnap(show){this.snap=show;}
  select(uid,focus=false){this.selectedId=uid;if(!uid){if(this.mode!=='move')this.setMode('navigate');this.restoreFocus();}else{if(this.mode==='navigate')this.setMode('select');if(focus)this.focusSelection();}this.updateSelection();this.invalidate();}
  focusSelection(force=false){
    const o=this.objects.get(this.selectedId);if(!o||this.view==='walk'||this.pendingDrag||this.dragging||(!force&&this.focusedId===this.selectedId))return;
    const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;
    if(!this.focusOrigin)this.focusOrigin={position:this.camera.position.clone(),target:this.controls.target.clone(),maxDistance:this.controls.maxDistance};
    const canvas=this.container.getBoundingClientRect(),inspector=this.container.parentElement.querySelector('.inspector')?.getBoundingClientRect();
    const toolbarBottom=Math.max(100,...[...(this.container.parentElement.querySelectorAll?.('.canvas-tools,.stage-heading,.stage-top-tools')||[])].map(node=>node.getBoundingClientRect()).filter(r=>r.width&&r.height).map(r=>r.bottom-canvas.top+16));
    const area=focusViewport(canvas,inspector,toolbarBottom),framing=frameBounds(this.camera,new THREE.Box3().setFromObject(o.group),canvas,area,this.controls.minDistance);
    this.controls.maxDistance=Math.max(this.controls.maxDistance,framing.position.distanceTo(framing.target)*1.05);this.camera.position.copy(framing.position);this.controls.target.copy(framing.target);this.controls.update();this.focusedId=this.selectedId;this.hideFocusOccluders?.(new THREE.Box3().setFromObject(o.group));this.invalidate(true);
  }
  hideFocusOccluders(bounds){
    this.restoreFocusWalls();if(!this.wallVisible)return;
    this.scene.updateMatrixWorld(true);const meshes=[];for(const wall of this.walls||[])if(wall.visible)wall.traverse(o=>{if(o.isMesh&&o.visible)meshes.push(o);});
    const ray=new THREE.Raycaster(),hidden=new Set(),targets=[bounds.getCenter(new THREE.Vector3())];
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])targets.push(new THREE.Vector3(x,y,z));
    for(const point of targets){const direction=point.clone().sub(this.camera.position);ray.set(this.camera.position,direction.clone().normalize());ray.far=direction.length()-.04;for(const hit of ray.intersectObjects(meshes,false))hidden.add(hit.object);}
    this.focusHiddenWalls=[...hidden];for(const wall of hidden)wall.visible=false;
  }
  restoreFocusWalls(){for(const wall of this.focusHiddenWalls||[])wall.visible=this.wallVisible;this.focusHiddenWalls=[];}
  restoreFocus(){
    this.restoreFocusWalls();
    if(this.focusOrigin){const saved=this.focusOrigin,damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.camera.position.copy(saved.position);this.controls.target.copy(saved.target);this.controls.maxDistance=saved.maxDistance;this.controls.update();this.controls.enableDamping=damping;this.invalidate(true);}this.focusOrigin=null;this.focusedId=null;
  }
  setInputBlocked(blocked){this.inputBlocked=blocked;if(blocked)this.releaseMouse();}
  ensureWalkPosition(){
    const layout=LAYOUTS.find(l=>l.id===this.design.layoutId),objects=[...this.objects.values()],safe=findWalkSpawn(layout,objects,this.camera.position);
    this.walkEscape=!safe;
    if(safe)this.camera.position.set(safe.x,1.65,safe.z);
    else{this.camera.position.set(0,1.65,layout.depth/2-.4);this.callbacks.onWalkNotice?.('This flat is full. Furniture collisions are relaxed until you reach an open spot.');}
    this.invalidate();
  }
  updateSelection(){const o=this.objects.get(this.selectedId);this.selection.visible=!!o;if(o){this.selection.box.setFromObject(o.group);this.selection.box.expandByScalar(.025);}}
  setView(view){
    this.releaseMouse();this.keys.clear();this.restoreFocus();
    this.navigationGesture=null;this.pendingDrag=null;
    this.view=view;const l=LAYOUTS.find(l=>l.id===this.design?.layoutId)||LAYOUTS[0];const dim=Math.max(l.width,l.depth);
    this.camera.fov=view==='walk'?68:38;this.camera.updateProjectionMatrix();
    if(this.walkEnvelope)this.walkEnvelope.visible=this.wallVisible&&view==='walk';
    this.controls.enabled=view!=='walk';this.controls.enableRotate=view==='orbit';
    if(view==='top'){const fit=Math.max(l.depth,l.width/this.camera.aspect)/(2*Math.tan(THREE.MathUtils.degToRad(this.camera.fov)/2))*1.12;this.camera.position.set(0,fit,.01);this.controls.target.set(0,0,0);}
    else if(view==='walk'){this.camera.position.set(0,1.65,l.depth/2-1);this.controls.target.set(0,1.65,-l.depth/2);this.camera.lookAt(this.controls.target);this.walkLook={yaw:0,pitch:0};this.ensureWalkPosition();this.setLookState('paused');}
    else{this.camera.position.set(dim*1.12,dim*.94,dim*1.25);this.controls.target.set(0,.45,0);}
    if(view!=='walk')this.controls.update();this.invalidate(true);
  }
  setLookState(state){this.lookState=state;this.callbacks.onLookState?.(state);}
  async captureMouse(){
    if(this.view!=='walk'||document.pointerLockElement===this.renderer.domElement)return;
    const canvas=this.renderer.domElement;
    if(!canvas.requestPointerLock){this.setLookState('fallback');return;}
    try{await canvas.requestPointerLock();}catch{if(this.view==='walk')this.setLookState('fallback');}
  }
  releaseMouse(){this.keys.clear();if(document.pointerLockElement===this.renderer.domElement)document.exitPointerLock?.();this.setLookState('paused');}
  enableFallbackLook(){this.keys.clear();this.setLookState('soft');}
  lookAround(x,y){this.walkLook=applyMouseLook(this.walkLook,x||0,y||0);this.camera.rotation.set(this.walkLook.pitch,this.walkLook.yaw,0,'YXZ');this.invalidate();}
  zoom(amount){if(this.view==='walk')return;const dir=this.camera.position.clone().sub(this.controls.target);dir.multiplyScalar(amount>0?.85:1.18);dir.clampLength(3,28);this.camera.position.copy(this.controls.target).add(dir);this.controls.update();}
  resetCamera(){this.setView(this.view);}
  ray(event){const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);}
  pointerDown(event){
    if(event.button!==0)return;
    if(this.view==='walk'){if(event.pointerType==='touch')this.enableFallbackLook();else if(this.lookState!=='soft')this.captureMouse();this.lookPointer={id:event.pointerId,x:event.clientX,y:event.clientY};return;}
    this.ray(event);const hits=this.raycaster.intersectObjects([...this.objects.values()].map(o=>o.group),true);const uid=hits[0]?.object.userData.uid;
    if(this.mode!=='move'||!uid){
      this.navigationGesture={uid,part:hits[0]?.object.userData.surface?.id||'body',startX:event.clientX,startY:event.clientY,pointerId:event.pointerId,moved:false};
      this.renderer.domElement.style.cursor='grabbing';
      return;
    }
    if(uid&&this.mode==='move'){
      const o=this.objects.get(uid);this.callbacks.onSelect(uid,false);this.select(uid);
      this.callbacks.onPartSelect?.(hits[0].object.userData.surface?.id||'body');
      this.dragPlane.constant=-o.group.position.y;const grabbed=new THREE.Vector3();this.raycaster.ray.intersectPlane(this.dragPlane,grabbed);
      this.pendingDrag={uid,startX:event.clientX,startY:event.clientY,original:o.group.position.clone(),offset:o.group.position.clone().sub(grabbed)};
      this.controls.enabled=false;event.stopImmediatePropagation();
    }
  }
  pointerMove(event){
    if(this.view==='walk'){
      if(this.lookState==='soft'&&event.pointerType!=='touch'&&event.target===this.renderer.domElement){this.lookAround(event.movementX,event.movementY);}
      else if(document.pointerLockElement!==this.renderer.domElement&&this.lookPointer?.id===event.pointerId&&(event.buttons===1||event.pointerType==='touch')){
        this.lookAround(event.clientX-this.lookPointer.x,event.clientY-this.lookPointer.y);
        this.lookPointer={id:event.pointerId,x:event.clientX,y:event.clientY};
      }
      return;
    }
    if(this.navigationGesture){const p=this.navigationGesture;if(Math.hypot(event.clientX-p.startX,event.clientY-p.startY)>5)p.moved=true;return;}
    if(!this.pendingDrag)return;
    const p=this.pendingDrag,o=this.objects.get(p.uid);if(!o)return;
    if(!this.dragging&&Math.hypot(event.clientX-p.startX,event.clientY-p.startY)<4)return;
    if(!this.dragging){this.dragging=p;this.callbacks.onDragStart?.();this.renderer.domElement.style.cursor='grabbing';if(o.body){o.oldMass=o.body.mass;o.body.mass=0;o.body.updateMassProperties();}}
    this.ray(event);this.dragPlane.constant=-p.original.y;
    if(this.raycaster.ray.intersectPlane(this.dragPlane,this.dragPoint)){
      const l=LAYOUTS.find(l=>l.id===this.design.layoutId);const[w,,d]=o.def.size;const s=o.item.scale;
      const cos=Math.abs(Math.cos(o.item.rotation)),sin=Math.abs(Math.sin(o.item.rotation));
      const bx=(w*cos+d*sin)*s/2,bz=(w*sin+d*cos)*s/2;
      let x=this.dragPoint.x+p.offset.x,z=this.dragPoint.z+p.offset.z,y=p.original.y;
      if(this.snap){x=Math.round(x*10)/10;z=Math.round(z*10)/10;}
      x=THREE.MathUtils.clamp(x,-l.width/2+bx+.1,l.width/2-bx-.1);z=THREE.MathUtils.clamp(z,-l.depth/2+bz+.1,l.depth/2-bz-.1);
      if(o.def.small){
        const supportHits=this.raycaster.intersectObjects([...this.objects.values()].filter(t=>t!==o&&!t.def.rug&&!t.def.ceiling).map(t=>t.group),true);
        for(const hit of supportHits){const normal=hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld);if(normal?.y>.75&&hit.point.y<2.7){x=hit.point.x;z=hit.point.z;y=hit.point.y+.004;break;}}
      }
      if(o.body&&!o.def.small){const previous=o.body.position.clone();o.body.position.set(x,y,z);o.body.aabbNeedsUpdate=true;const others=[...this.objects.values()].filter(t=>t!==o&&!t.def.small&&t.body).map(t=>t.body);if(!canPlaceBody(this.world,o.body,others)){o.body.position.copy(previous);o.body.aabbNeedsUpdate=true;return;}}
      o.group.position.set(x,y,z);if(o.body){o.body.position.set(x,y,z);o.body.velocity.setZero();o.body.aabbNeedsUpdate=true;}
      this.updateSelection();this.invalidate(true);this.callbacks.onDragPosition?.({x,y,z});
    }
  }
  pointerUp(event){
    this.lookPointer=null;
    const gesture=this.navigationGesture;this.navigationGesture=null;
    if(event&&gesture&&event.pointerId===gesture.pointerId&&!gesture.moved&&Math.hypot(event.clientX-gesture.startX,event.clientY-gesture.startY)<=5){
      const uid=this.objects.has(gesture.uid)?gesture.uid:null;this.callbacks.onSelect(uid,true);this.select(uid);
      if(uid)this.callbacks.onPartSelect?.(gesture.part);
    }
    const focusAfterClick=event&&this.pendingDrag&&!this.dragging?this.pendingDrag.uid:null;
    if(this.dragging){const o=this.objects.get(this.dragging.uid);if(o){if(o.body){o.body.mass=o.oldMass??o.body.mass;o.body.updateMassProperties();o.body.wakeUp();}this.callbacks.onMove(this.dragging.uid,{x:o.group.position.x,y:o.group.position.y,z:o.group.position.z});if(!o.def.small)for(const small of this.objects.values())if(small.def.small)small.body?.wakeUp();}}
    this.dragging=null;this.pendingDrag=null;this.controls.enabled=this.view!=='walk';this.setMode(this.mode);if(focusAfterClick)this.callbacks.onSelect(focusAfterClick,true);
  }
  beginCatalogDrag(def){
    this.cancelCatalogDrag();this.keys.clear();
    const group=createModel(def),materials=new Map();
    group.traverse(mesh=>{if(!mesh.isMesh)return;const clone=m=>{if(!materials.has(m)){const copy=m.clone();copy.transparent=true;copy.opacity=.52;copy.depthWrite=false;materials.set(m,copy);}return materials.get(m);};mesh.material=Array.isArray(mesh.material)?mesh.material.map(clone):clone(mesh.material);mesh.castShadow=false;});
    group.visible=false;this.scene.add(group);
    const outline=new THREE.Box3Helper(new THREE.Box3(),'#819b66');outline.visible=false;this.scene.add(outline);
    this.catalogPreview={def,group,outline,materials,body:createBody(def,makeItem(def.id),group.userData.collisionBoxes)};
  }
  updateCatalogDrag(event){
    const preview=this.catalogPreview;if(!preview||this.contextLost||this.renderFailed)return null;
    const rect=this.container.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom){this.hideCatalogPreview();return null;}
    this.ray(event);const {def,group,body,outline}=preview,layout=LAYOUTS.find(l=>l.id===this.design.layoutId),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-itemElevation(def)),point=new THREE.Vector3();
    if(!this.raycaster.ray.intersectPlane(plane,point)||Math.abs(point.x)>layout.width/2||Math.abs(point.z)>layout.depth/2){this.hideCatalogPreview();return null;}
    let y=itemElevation(def);
    if(def.small){
      const hits=this.raycaster.intersectObjects([...this.objects.values()].filter(o=>!o.def.rug&&!o.def.ceiling).map(o=>o.group),true);
      for(const hit of hits){const normal=hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld);if(normal?.y>.75&&hit.point.y+def.size[1]<3.08){point.copy(hit.point);y=hit.point.y+.006;break;}}
    }
    if(this.snap){point.x=Math.round(point.x*10)/10;point.z=Math.round(point.z*10)/10;}
    const x=THREE.MathUtils.clamp(point.x,-layout.width/2+def.size[0]/2+.1,layout.width/2-def.size[0]/2-.1),z=THREE.MathUtils.clamp(point.z,-layout.depth/2+def.size[2]/2+.1,layout.depth/2-def.size[2]/2-.1);
    let valid=this.design.items.length<400;
    if(body){body.position.set(x,y,z);body.aabbNeedsUpdate=true;valid=valid&&canPlaceBody(this.world,body,this.world.bodies);}
    group.position.set(x,y,z);group.visible=true;outline.box.setFromObject(group);outline.visible=true;outline.material.color.set(valid?'#819b66':'#b56c54');
    preview.position=valid?{x,y,z}:null;this.invalidate();return {x,y,z,valid};
  }
  hideCatalogPreview(){if(this.catalogPreview){this.catalogPreview.group.visible=false;this.catalogPreview.outline.visible=false;this.catalogPreview.position=null;this.invalidate();}}
  cancelCatalogDrag(){
    const preview=this.catalogPreview;if(!preview)return;
    this.scene.remove(preview.group,preview.outline);disposeOwnedGeometry(preview.group);preview.materials.forEach(m=>m.dispose());preview.outline.geometry.dispose();preview.outline.material.dispose();this.catalogPreview=null;this.invalidate();
  }
  async snapshot(){if(this.contextLost||this.renderFailed||this.renderer.getContext().isContextLost())return null;this.selection.visible=false;this.grid.visible=false;this.renderer.shadowMap.needsUpdate=true;this.composer.render();const data=this.renderer.domElement.toDataURL('image/png');this.updateSelection();this.grid.visible=!!this.gridState;this.invalidate();return data;}
  animate(){
    if(this.disposed||this.contextLost||this.renderFailed)return;const dt=Math.min(this.clock.getDelta(),.05);
    if(this.world&&[...this.objects.values()].some(o=>o.body?.mass>0&&o.body.sleepState!==2)){this.world.step(1/60,dt,3);this.invalidate(true);for(const o of this.objects.values())if(o.body?.mass>0&&this.dragging?.uid!==o.item.uid){o.group.position.copy(o.body.position);o.group.quaternion.copy(o.body.quaternion);}}
    if(this.view==='walk'){
      const active=this.lookState==='locked'||this.lookState==='soft';
      const keys=active?this.keys:new Set();
      if(keys.has('arrowleft'))this.walkLook.yaw+=dt*1.4;if(keys.has('arrowright'))this.walkLook.yaw-=dt*1.4;
      const speed=dt*(keys.has('shift')?4.2:2.8),direction=walkingDirection(keys,this.walkLook.yaw);
      const layout=LAYOUTS.find(l=>l.id===this.design.layoutId),objects=[...this.objects.values()];
      const next=slideWalk(layout,objects,this.camera.position,{x:direction.x*speed,z:direction.z*speed},this.walkEscape);
      if(this.walkEscape&&!walkBlocked(layout,objects,next))this.walkEscape=false;
      if(next.x!==this.camera.position.x||next.z!==this.camera.position.z){this.camera.position.x=next.x;this.camera.position.z=next.z;this.invalidate();}
      if(keys.has('arrowleft')||keys.has('arrowright'))this.invalidate();this.camera.rotation.set(this.walkLook.pitch,this.walkLook.yaw,0,'YXZ');
    }else{
      if(this.view==='orbit'&&!this.inputBlocked&&!this.pendingDrag&&!this.catalogPreview){
        const forward=this.controls.target.clone().sub(this.camera.position),yaw=Math.atan2(-forward.x,-forward.z),keys=new Set([...this.keys].filter(k=>['w','a','s','d'].includes(k))),direction=walkingDirection(keys,yaw),speed=dt*(this.keys.has('shift')?7:3.5),layout=LAYOUTS.find(l=>l.id===this.design?.layoutId);
        if(layout&&(direction.x||direction.z)){const delta=new THREE.Vector3(direction.x*speed,0,direction.z*speed);delta.x=THREE.MathUtils.clamp(this.controls.target.x+delta.x,-layout.width/2-3,layout.width/2+3)-this.controls.target.x;delta.z=THREE.MathUtils.clamp(this.controls.target.z+delta.z,-layout.depth/2-3,layout.depth/2+3)-this.controls.target.z;this.camera.position.add(delta);this.controls.target.add(delta);this.invalidate();}
      }
      this.controls.update();
    }
    if(document.hidden||!this.dirty||performance.now()-this.lastRender<1000/this.frameLimit)return;
    this.updateSelection();if(this.shadowDirty){this.renderer.shadowMap.needsUpdate=true;this.shadowDirty=false;}
    try{this.composer.render();this.dirty=false;this.lastRender=performance.now();}catch(error){this.renderFailed=true;this.releaseMouse();this.pointerUp();this.renderer.domElement.dataset.renderState='failed';this.callbacks.onRenderStatus?.('failed');console.error('The 3D renderer was interrupted.',error);}
  }
  dispose(){this.cancelCatalogDrag();this.interiorLights?.traverse(o=>o.shadow?.dispose());this.releaseMouse();this.disposed=true;this.renderer.setAnimationLoop(null);this.resizeObserver?.disconnect();this.bindings?.forEach(fn=>fn());this.controls?.dispose();this.objects.forEach(o=>this.removeObject(o));disposeOwnedGeometry(this.scene);this.sun?.shadow.dispose();this.envTarget?.dispose();this.composer?.passes.forEach(p=>p.dispose?.());this.composer?.dispose();this.renderer.dispose();if(!this.renderer.getContext().isContextLost())this.renderer.forceContextLoss();this.renderer.domElement.remove();}
}
