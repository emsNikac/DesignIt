import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createModel} from './models.js';
import {disposeOwnedGeometry} from './mesh-optimizer.js';

const cache=new Map(),requests=new Map();let running=false;
export function requestThumbnail(def,callback){
  if(cache.has(def.id)){callback(cache.get(def.id));return()=>{};}
  if(!requests.has(def.id))requests.set(def.id,{def,listeners:new Set()});
  const request=requests.get(def.id);request.listeners.add(callback);
  if(!running){running=true;setTimeout(run,0);}
  return()=>{request.listeners.delete(callback);};
}

function run(){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{running=false;requests.clear();return;}
  renderer.setSize(240,190);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight('#fff7e8','#c4bead',1.6));const light=new THREE.DirectionalLight('#fff3dc',2.6);light.position.set(-3,6,5);light.castShadow=true;light.shadow.mapSize.set(512,512);scene.add(light);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.5;room.dispose();pmrem.dispose();
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.1}));plane.rotation.x=-Math.PI/2;plane.receiveShadow=true;plane.position.y=-.008;scene.add(plane);
  const camera=new THREE.PerspectiveCamera(32,240/190,.01,100);
  const finish=()=>{env.dispose();plane.geometry.dispose();plane.material.dispose();light.shadow.map?.dispose();renderer.dispose();running=false;};
  const next=()=>{
    const entry=requests.entries().next().value;if(!entry){finish();return;}
    const [id,{def,listeners}]=entry;requests.delete(id);
    if(listeners.size){
      const model=createModel(def);scene.add(model);
      try{
        const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),dim=Math.max(size.x,size.z,size.y*1.12);
        camera.position.copy(center).add(new THREE.Vector3(dim*1.4,dim*.85,dim*1.65));camera.lookAt(center);renderer.render(scene,camera);
        const url=renderer.domElement.toDataURL('image/png');cache.set(id,url);listeners.forEach(fn=>fn(url));
      }finally{scene.remove(model);disposeOwnedGeometry(model);}
    }
    setTimeout(next,12);
  };next();
}
