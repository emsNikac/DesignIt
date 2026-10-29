import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildCollectionModel } from './collection-models.js';
import { buildHobbyModel } from './hobby-models.js';
import { buildHomeModel } from './home-models.js';
import {buildOutdoorModel} from './outdoor-models.js';
import {buildDesignModel} from './design-models.js';
import {drawDesignerRug} from './designer-rugs.js';
import { drawFloorPattern } from './floors.js';
import { makeSurface, collectParts } from './appearance.js';
import { sharedGeometry, batchModel } from './mesh-optimizer.js';
import {LruCache} from './lru-cache.js';

const materials = new LruCache(128);
const textures = new LruCache(32);
const C = THREE;
function rng(seed = 13) { return () => { seed = Math.imul(1664525, seed) + 1013904223 | 0; return (seed >>> 0) / 4294967296; }; }

export function makeTexture(type = 'wood', color = '#b8966d') {
  const key = `${type}-${color}`;
  if (textures.has(key)) return textures.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const random = rng(21);
  ctx.fillStyle = color; ctx.fillRect(0, 0, 512, 512);
  if (type === 'wood' || type === 'floor') {
    const rows = type === 'floor' ? 12 : 5;
    const h = 512 / rows;
    for (let row = 0; row < rows; row++) {
      const offset = row % 3 * 170;
      for (let col = -1; col < 3; col++) {
        const start = col * 340 + offset;
        ctx.fillStyle = random() > .45 ? `rgba(255,237,197,${random()*.17})` : `rgba(51,29,8,${random()*.1})`;
        ctx.fillRect(start, row * h, 339, h - .8);
        ctx.strokeStyle = 'rgba(66,42,24,.12)'; ctx.lineWidth = .7;
        ctx.strokeRect(start, row * h, 340, h);
      }
      for (let line = 0; line < 45; line++) {
        const y = row * h + random() * h;
        ctx.beginPath(); ctx.moveTo(0, y);
        ctx.bezierCurveTo(150, y + random()*6-3, 350, y + random()*6-3, 512, y);
        ctx.strokeStyle = `rgba(${random()>.5?'57,32,9':'255,233,192'},${random()*.09})`; ctx.lineWidth = random() * 1.5; ctx.stroke();
      }
    }
  } else if (type === 'cloth' || type === 'rug') {
    for (let i = 0; i < 512; i += type === 'rug' ? 3 : 2) {
      ctx.fillStyle = `rgba(255,255,255,${.03+random()*.09})`; ctx.fillRect(i, 0, 1, 512);
      ctx.fillStyle = `rgba(30,24,15,${.025+random()*.06})`; ctx.fillRect(0, i, 512, 1);
    }
    if (type === 'rug') { ctx.strokeStyle='rgba(255,247,226,.35)'; ctx.lineWidth=6; ctx.strokeRect(20,20,472,472); ctx.lineWidth=2;ctx.strokeRect(30,30,452,452); }
  } else if (type === 'tile') {
    for(let y=0;y<8;y++) for(let x=0;x<8;x++) {
      ctx.fillStyle = random() > .5 ? `rgba(255,255,255,${random()*.15})` : `rgba(55,48,32,${random()*.07})`;
      ctx.fillRect(x*64+1,y*64+1,62,62);
      ctx.strokeStyle='rgba(245,239,220,.65)';ctx.lineWidth=2;ctx.strokeRect(x*64,y*64,64,64);
    }
  } else if (type === 'terrazzo') {
    const chips=['#ad9c87','#ebe4d4','#8a8c7e','#c8a28b','#b5b3a2'];
    for(let i=0;i<2300;i++){const x=random()*512,y=random()*512,r=1+random()*5;ctx.fillStyle=chips[i%chips.length];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+r,y-r*.5);ctx.lineTo(x+r*.7,y+r);ctx.lineTo(x-r*.5,y+r*.4);ctx.fill();}
  } else if (drawDesignerRug(ctx,type)||drawFloorPattern(ctx,type,random)) {
    // Additional floor materials draw onto the same pooled procedural textures.
  } else if (type === 'marble') {
    for(let i=0;i<12;i++){ctx.beginPath();const y=random()*512;ctx.moveTo(0,y);ctx.bezierCurveTo(140,y+random()*150,300,y-random()*160,512,y+random()*100);ctx.strokeStyle=`rgba(115,108,93,${.06+random()*.12})`;ctx.lineWidth=random()*2;ctx.stroke();}
  }
  if (!['cloth','rug'].includes(type)) for (let i=0;i<12000;i++){ctx.fillStyle=`rgba(${random()>.5?'255,255,255':'30,25,15'},.025)`;ctx.fillRect(random()*512,random()*512,1,1);}
  const tex = new C.CanvasTexture(canvas); tex.colorSpace = C.SRGBColorSpace;
  tex.wrapS = tex.wrapT = C.RepeatWrapping; tex.anisotropy = 8;
  textures.set(key,tex); return tex;
}

export function material(color, type = 'matte') {
  const key = `${color}-${type}`;
  if (materials.has(key)) return materials.get(key);
  const opts={color, roughness:.76, metalness:0};
  if(type==='wood') {opts.map=makeTexture('wood',color);opts.color='#ffffff';opts.roughness=.49;opts.bumpMap=opts.map;opts.bumpScale=.015;}
  if(type==='cloth'){opts.map=makeTexture('cloth',color);opts.color='#ffffff';opts.roughness=.95;opts.bumpMap=opts.map;opts.bumpScale=.012;}
  if(type==='metal'){opts.metalness=.72;opts.roughness=.28;}
  if(type==='ceramic'){opts.roughness=.22;}
  if(type==='marble'){opts.map=makeTexture('marble',color);opts.color='#ffffff';opts.roughness=.21;}
  if(type==='glass'){opts.transparent=true;opts.opacity=.18;opts.roughness=.08;opts.metalness=.1;opts.depthWrite=false;}
  if(type==='rug'){opts.map=makeTexture('rug',color);opts.color='#ffffff';opts.roughness=1;opts.bumpMap=opts.map;opts.bumpScale=.02;}
  if(type.startsWith('designer-rug|')){opts.map=makeTexture(type,color);opts.color='#ffffff';opts.roughness=1;opts.bumpMap=opts.map;opts.bumpScale=.012;}
  if(type==='leather'){opts.map=makeTexture('cloth',color);opts.color='#ffffff';opts.roughness=.45;opts.bumpMap=opts.map;opts.bumpScale=.006;}
  if(type==='terrazzo'){opts.map=makeTexture('terrazzo',color);opts.color='#ffffff';opts.roughness=.35;}
  if(type==='stone'){opts.roughness=.92;}
  if(type==='grass'||type==='gravel'){opts.map=makeTexture(type,color);opts.color='#ffffff';opts.bumpMap=opts.map;opts.bumpScale=.025;opts.roughness=1;}
  if(type==='lacquer'){opts.roughness=.16;}
  if(type==='brushed'){opts.metalness=1;opts.roughness=.45;}
  if(type==='mirror'){opts.metalness=1;opts.roughness=.02;}
  if(type==='glow'){opts.emissive=color;opts.emissiveIntensity=.6;opts.roughness=.65;}
  const m = new C.MeshStandardMaterial(opts); materials.set(key,m); return m;
}

function mesh(group, geometry, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0) {
  const surface=mat?.isSurface?mat:null;
  const m = new C.Mesh(geometry, surface?surface.resolve():mat);if(surface)m.userData.surface={id:surface.id,defaultColor:surface.defaultColor,defaultFinish:surface.defaultFinish}; m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=true;m.receiveShadow=true;group.add(m);return m;
}
function box(g,w,h,d,x,y,z,m,r=.025,ry=0) {return mesh(g,sharedGeometry(`box:${w}:${h}:${d}:${r}`,()=>r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new C.BoxGeometry(w,h,d)),m,x,y,z,0,ry);}
function cyl(g,rt,rb,h,x,y,z,m,n=40) {return mesh(g,sharedGeometry(`cylinder:${rt}:${rb}:${h}:${n}`,()=>new C.CylinderGeometry(rt,rb,h,n)),m,x,y,z);}
function ball(g,x,y,z,sx,sy,sz,m) {const o=mesh(g,sharedGeometry('sphere',()=>new C.SphereGeometry(1,24,16)),m,x,y,z);o.scale.set(sx,sy,sz);return o;}
function tube(g,a,b,r,m){const va=new C.Vector3(...a),vb=new C.Vector3(...b),d=vb.clone().sub(va);const o=mesh(g,sharedGeometry(`tube:${r}:${d.length()}`,()=>new C.CylinderGeometry(r,r,d.length(),12)),m,...va.clone().add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new C.Vector3(0,1,0),d.normalize());return o;}
function torus(g,r,t,x,y,z,m,rx=0,arc=Math.PI*2) {return mesh(g,sharedGeometry(`torus:${r}:${t}:${arc}`,()=>new C.TorusGeometry(r,t,10,48,arc)),m,x,y,z,rx);}
function legs(g,w,d,h,m,y=0){for(const x of [-1,1])for(const z of [-1,1])cyl(g,.027,.021,h,x*w/2,y+h/2,z*d/2,m,16);}

function plant(g,color,small=false,monstera=false,part=(id,c,t)=>material(c,t)) {
  const scale=small?.3:monstera?.75:1;
  const holder=new C.Group();g.add(holder);holder.scale.setScalar(scale);
  const clay=part('pot',small?'#b7ad98':monstera?'#c7bc9f':'#a87959','matte');
  cyl(holder,.22,.17,.39,0,.195,0,clay);torus(holder,.207,.022,0,.39,0,clay,Math.PI/2);
  cyl(holder,.195,.195,.025,0,.38,0,material('#463f2d'));
  const stem=material('#666444');
  tube(holder,[0,.38,0],[.04,1.5,0],.018,stem);
  const random=rng(8);
  for(let i=0;i<30;i++){
    const angle=i*2.399, height=.68+(i/30)*.94, radius=.15+random()*.22;
    const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
    tube(holder,[.02,height-.15,0],[x,height,z],.006,stem);
    const leaf=ball(holder,x,height,z,monstera?.19:.13,.027,monstera?.12:.065,part('foliage',new C.Color(color).multiplyScalar(.78+random()*.5).getStyle(),'matte'));
    leaf.rotation.set(random()*.8,angle,random()*.5);
  }
}

const pooledMaterial=material;
function captureCollisionBoxes(group){
  group.updateMatrixWorld(true);const boxes=[];
  group.traverse(o=>{if(!o.isMesh)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();boxes.push(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));});
  return boxes;
}
function fitCollisionBoxes(boxes,group){
  if(!boxes)return;group.updateMatrix();const seen=new Set();
  return boxes.flatMap(box=>{box.applyMatrix4(group.matrix);const size=box.getSize(new C.Vector3()).toArray().map(n=>Math.max(.003,n)),center=box.getCenter(new C.Vector3()).toArray(),key=[...size,...center].map(n=>n.toFixed(5)).join(',');if(seen.has(key))return[];seen.add(key);return[{size,center}];});
}
export function createModel(def, overrideColor, appearance={}, pattern, optimize=true) {
  if(pattern)def={...def,pattern:pattern==='plain'?false:pattern};
  const g=new C.Group();const color=overrideColor||def.color;
  const part=(id,c,t='matte')=>makeSurface(id,c,t,appearance,pooledMaterial);
  const material=(c,t='matte')=>part(c===color?'body':t==='wood'?'frame':t==='cloth'||t==='rug'?'accent':t==='metal'?'hardware':t==='glass'?'glass':t==='glow'?'shade':t==='marble'?'top':t==='ceramic'?'ceramic':'details',c,t);
  const wood=part('frame','#ac855d','wood'),darkwood=part('frame','#76543b','wood'),metal=part('hardware','#76664b','metal'),black=part('frame','#36382f','metal');
  const fabric=part('body',color,'cloth'),white=part('ceramic','#eeeae0','ceramic'),body=part('body',color,'matte'),top=part('top','#e6e0d4','marble');
  switch(def.model){
    case 'sofa': {
      legs(g,2.48,.75,.15,darkwood);
      box(g,2.8,.28,1.05,0,.28,0,fabric,.1);
      box(g,2.5,.56,.22,0,.63,-.4,fabric,.1);
      for(let i=-1;i<=1;i++){
        box(g,.78,.23,.77,i*.79,.47,.06,fabric,.085);
        const b=box(g,.77,.46,.21,i*.79,.7,-.33,fabric,.085);b.rotation.x=-.1;
      }
      for(const x of [-1.28,1.28])box(g,.24,.43,.99,x,.52,.02,fabric,.095);
      const pillowMat=part('accent','#d0c0a0','cloth'),pillow2=part('accent','#b59a76','cloth');
      for(const [x,m,rz] of [[-.93,pillowMat,-.19],[.94,pillow2,.22]]){const p=box(g,.4,.39,.16,x,.72,-.13,m,.08);p.rotation.set(-.22,0,rz);}
      break;
    }
    case 'chair':{
      legs(g,.58,.57,.2,wood);
      box(g,.9,.29,.85,0,.35,0,fabric,.13);
      box(g,.72,.23,.65,0,.53,.08,fabric,.12);
      box(g,.85,.43,.2,0,.68,-.32,fabric,.1);
      for(const x of [-.36,.36])box(g,.2,.3,.7,x,.6,.02,fabric,.09);
      break;
    }
    case 'diningchair':{
      const m=material(color,'wood');legs(g,.38,.39,.46,m);
      box(g,.48,.08,.46,0,.47,.03,material('#cec2a8','cloth'),.045);
      for(const x of [-.2,.2])tube(g,[x,.4,-.18],[x,.83,-.23],.022,m);
      box(g,.45,.22,.065,0,.74,-.22,m,.035);
      break;
    }
    case 'stool':{
      const m=material(color,'wood');legs(g,.3,.3,.7,m);
      cyl(g,.22,.22,.07,0,.715,0,m);
      torus(g,.18,.012,0,.27,0,metal,Math.PI/2);break;
    }
    case 'bench':{
      const m=material(color,'wood');box(g,1.45,.08,.4,0,.42,0,m,.035);legs(g,1.2,.26,.4,m);break;
    }
    case 'coffee':{
      const m=material(color,'wood');
      const topmesh=cyl(g,.5,.5,.065,0,.365,0,part('top',color,'wood'),64);topmesh.scale.set(1.35,1,.75);
      for(const x of [-.36,.36]){const p=cyl(g,.12,.15,.32,x,.17,0,m,32);p.scale.z=1.8;}
      break;
    }
    case 'side':{
      const m=material(color,'marble');cyl(g,.225,.225,.055,0,.47,0,part('top',color,'marble'));cyl(g,.12,.15,.44,0,.22,0,m);
      for(let i=0;i<24;i++){const a=i/24*Math.PI*2;cyl(g,.008,.009,.4,Math.sin(a)*.13,.22,Math.cos(a)*.13,m,6);}break;
    }
    case 'dining':{
      const m=material(color,'wood');cyl(g,.7,.7,.065,0,.727,0,part('top',color,'wood'),64);cyl(g,.23,.28,.7,0,.35,0,m);
      for(let i=0;i<36;i++){const a=i/36*Math.PI*2;cyl(g,.012,.013,.64,Math.sin(a)*.25,.35,Math.cos(a)*.25,m,6);}break;
    }
    case 'desk':{
      const m=material(color,'wood');box(g,1.4,.06,.65,0,.73,0,part('top',color,'wood'));legs(g,1.2,.48,.7,m);box(g,.45,.13,.54,.38,.63,0,m);box(g,.12,.01,.018,.38,.65,.28,metal);break;
    }
    case 'shelf':{
      const m=material(color,'wood');
      for(const x of [-.77,0,.77])box(g,.055,2,.36,x,1,0,m,.006);
      for(let i=0;i<5;i++)box(g,1.6,.045,.36,0,.43+i*.46,0,m,.006);
      for(const x of [-.67,.67])box(g,.08,.41,.3,x,.205,0,m,.012);
      break;
    }
    case 'console': case 'dresser': case 'nightstand': case 'wardrobe':{
      const [w,h,d]=def.size,m=material(color,'wood');
      legs(g,w-.18,d-.12,.12,black);box(g,w,h-.13,d,0,(h+.13)/2,0,part('frame',color,'wood'),.016);
      if(def.model==='dresser'||def.model==='nightstand'){
        const count=def.model==='dresser'?3:2;
        for(let i=0;i<count;i++){const y=.14+(h-.13)/count*(i+.5);box(g,w-.035,(h-.16)/count-.018,.025,0,y,d/2+.008,m,.005);box(g,w*.22,.014,.025,0,y,d/2+.03,metal,.005);}
      }else{
        for(let i=0;i<2;i++){box(g,w/2-.025,h-.16,.025,(i-.5)*w/2,(h+.13)/2,d/2+.008,m,.005);box(g,.015,.22,.028,(i-.5)*.13,h*.55,d/2+.03,metal,.005);}
        if(def.model==='console')for(let i=0;i<45;i++)box(g,.01,h-.18,.014,-w/2+.035+i*(w-.07)/44,(h+.13)/2,d/2+.025,m,.003);
      }
      break;
    }
    case 'floorlamp':{
      cyl(g,.23,.23,.045,0,.025,0,black);tube(g,[0,.05,0],[0,1.68,0],.018,metal);
      tube(g,[0,1.68,0],[.31,1.87,0],.018,metal);tube(g,[.31,1.87,0],[.55,1.87,0],.018,metal);
      cyl(g,.08,.23,.22,.55,1.72,0,material('#d6cbb5'));cyl(g,.2,.2,.009,.55,1.61,0,material('#ffe9b3','glow'));
      break;
    }
    case 'tablelamp':{
      cyl(g,.09,.12,.18,0,.09,0,material(color,'ceramic'));cyl(g,.025,.025,.11,0,.2,0,metal);
      ball(g,0,.32,0,.18,.12,.18,material(color,'glow'));cyl(g,.175,.175,.014,0,.31,0,material(color,'glow'));break;
    }
    case 'paperlamp':{
      cyl(g,.17,.17,.035,0,.018,0,black);tube(g,[0,.02,0],[0,1.1,0],.013,black);
      ball(g,0,1.13,0,.25,.36,.25,material(color,'glow'));
      for(let i=0;i<14;i++){const y=.8+i*.048,r=.25*Math.sqrt(Math.max(0,1-((y-1.13)/.36)**2));torus(g,r,.002,0,y,0,material('#c2b89f'),Math.PI/2);}break;
    }
    case 'pendant':{
      tube(g,[0,.2,0],[0,.8,0],.005,black);cyl(g,.07,.33,.24,0,.18,0,material(color));
      for(let i=0;i<44;i++){const a=i/44*Math.PI*2;tube(g,[Math.sin(a)*.07,.3,Math.cos(a)*.07],[Math.sin(a)*.33,.06,Math.cos(a)*.33],.005,wood);}
      cyl(g,.29,.29,.012,0,.06,0,material('#ffe9bd','glow'));break;
    }
    case 'tasklamp':{
      cyl(g,.13,.13,.025,0,.014,0,body);tube(g,[0,.02,0],[0,.35,0],.013,body);tube(g,[0,.35,0],[.14,.5,0],.012,body);cyl(g,.045,.1,.1,.14,.48,0,body);break;
    }
    case 'plant': plant(g,color,false,false,part);break;
    case 'smallplant': plant(g,color,true,false,part);break;
    case 'monstera': plant(g,color,false,true,part);break;
    case 'vase':{
      const points=[[.0,0],[.065,0],[.09,.04],[.105,.13],[.09,.22],[.045,.28],[.042,.34],[.028,.34],[.03,.28],[.07,.2]].map(p=>new C.Vector2(...p));
      mesh(g,sharedGeometry('vase-lathe',()=>new C.LatheGeometry(points,40)),material(color,'ceramic'));
      torus(g,.035,.007,0,.34,0,material(color,'ceramic'),Math.PI/2);break;
    }
    case 'books':{
      const colors=['#b9ad8f','#637163','#ae7d60','#e0d4ba','#6e6b5d'];
      for(let i=0;i<5;i++){const h=.23+(i%3)*.028,x=(i-2)*.067;box(g,.06,h,.17,x,h/2,0,part('body',colors[i],'matte'),.003);box(g,.048,h-.018,.16,x,h/2,.006,part('pages','#e1d6bc','matte'),.001);box(g,.06,h,.012,x,h/2,.085,part('body',colors[i],'matte'),.002);for(let l=0;l<2;l++)box(g,.04,.004,.002,x,h*.7-l*.02,.092,material('#d4c8ad'),0);}
      break;
    }
    case 'bookstack':{
      for(let i=0;i<3;i++){const o=box(g,.32,.04,.24,0,.02+i*.043,0,material(['#92826a','#b3a58b','#d2c4a8'][i]),.004,i*.1);box(o,.3,.025,.231,0,0,.007,material('#e6decc'),.001);}break;
    }
    case 'bowl':{
      const p=[[0,0],[.07,0],[.13,.04],[.15,.09],[.142,.09],[.12,.05],[.06,.01]].map(v=>new C.Vector2(...v));mesh(g,sharedGeometry('bowl-lathe',()=>new C.LatheGeometry(p,40)),material(color,'ceramic'));break;
    }
    case 'candle':{
      cyl(g,.05,.05,.15,0,.075,0,material(color,'ceramic'));cyl(g,.044,.044,.01,0,.15,0,material('#e7d5aa'));ball(g,0,.17,0,.01,.025,.01,material('#ffcc70','glow'));break;
    }
    case 'mirror':{
      box(g,.75,1.8,.05,0,.9,0,material(color,'metal'),.2);box(g,.69,1.73,.018,0,.9,.03,part('glass','#c1cdca','mirror'),.19);break;
    }
    case 'art':{
      box(g,.9,1.15,.06,0,.575,0,wood,.008);box(g,.82,1.07,.012,0,.575,.035,material('#e7dfcc'),0);
      ball(g,-.12,.68,.05,.2,.25,.006,material(color));box(g,.25,.5,.008,.16,.4,.05,material('#797e64'),.002);ball(g,.12,.82,.06,.16,.16,.006,material('#c5a57b'));break;
    }
    case 'rug': case 'roundrug': case 'oval-rug':{
      const m=part('body',color,'rug');
      if(def.model==='rug'){
        box(g,3.1,.025,2.2,0,.018,0,m,.01);
        for(const side of [-1,1])for(let i=0;i<70;i++)box(g,.075,.012,.009,side*1.58,.016,-1.07+i*.031,material(color,'cloth'),0);
        const accent=material('#e1d5bd','cloth');
        if(def.pattern==='stripes')for(let i=-4;i<=4;i++)box(g,.06,.002,2.1,i*.32,.033,0,accent,0);
        else if(def.pattern==='checker')for(let x=0;x<8;x++)for(let z=0;z<6;z++)if((x+z)%2===0)box(g,.365,.002,.345,-1.3+x*.37,.033,-.88+z*.35,accent,0);
        else if(def.pattern==='shag')for(let x=0;x<26;x++)for(let z=0;z<18;z++)box(g,.09,.025,.09,-1.46+x*.115,.038,-1.02+z*.12,accent,.02);
        else if(def.pattern)for(let i=-2;i<=2;i++)for(const sign of [-1,1]){const line=box(g,.72,.002,.018,i*.52,.033,sign*.24,accent,0);line.rotation.y=sign*Math.PI/4;}
      }else {const r=cyl(g,1,1,.025,0,.018,0,m,64);if(def.model==='oval-rug')r.scale.z=.65;}
      break;
    }
    case 'kitchen':{
      const m=material(color);box(g,2.7,.84,.62,0,.46,0,m,.012);box(g,2.76,.055,.68,0,.927,0,top,.012);
      for(let i=0;i<5;i++){box(g,.514,.77,.025,-1.07+i*.535,.48,.323,m,.006);box(g,.21,.014,.03,-1.07+i*.535,.78,.343,metal,.004);}
      box(g,.56,.018,.41,-.72,.96,0,material('#767a71','metal'),.045);box(g,.47,.011,.32,-.72,.968,0,material('#414b44'),.04);
      tube(g,[-.72,.96,-.2],[-.72,1.2,-.2],.016,metal);tube(g,[-.72,1.2,-.2],[-.72,1.2,-.05],.016,metal);tube(g,[-.72,1.2,-.05],[-.72,1.16,-.05],.016,metal);
      box(g,.73,.012,.5,.64,.963,0,part('cooktop','#36382f','metal'),.012);for(const x of [.43,.86])for(const z of [-.12,.12])torus(g,.078,.008,x,.977,z,material('#74776b','metal'),Math.PI/2);
      break;
    }
    case 'island':{
      const m=material(color,'wood');box(g,1.55,.87,.67,0,.45,0,m,.014);box(g,1.7,.055,.8,0,.912,0,top,.012);
      for(let i=0;i<29;i++)box(g,.014,.8,.012,-.74+i*.053,.46,.344,m,.003);break;
    }
    case 'fridge':{
      box(g,.65,1.8,.66,0,.9,0,material(color,'ceramic'),.07);
      box(g,.62,1.12,.05,0,1.21,.335,material(color,'ceramic'),.04);box(g,.62,.61,.05,0,.327,.335,material(color,'ceramic'),.04);
      box(g,.027,.38,.052,-.23,1.13,.39,metal,.014);box(g,.027,.21,.052,-.23,.44,.39,metal,.014);break;
    }
    case 'oven':{
      box(g,.65,.89,.64,0,.445,0,body);box(g,.55,.51,.025,0,.38,.33,black,.018);box(g,.44,.33,.014,0,.38,.345,material('#232c26','glass'),.012);
      box(g,.44,.025,.04,0,.64,.36,metal,.008);box(g,.65,.03,.65,0,.9,0,black);
      for(const x of [-.18,.18])for(const z of [-.18,.18])torus(g,.09,.01,x,.92,z,metal,Math.PI/2);for(const x of [-.2,0,.2])cyl(g,.025,.025,.018,x,.78,.33,metal);break;
    }
    case 'kettle':{
      ball(g,0,.095,0,.1,.09,.1,material(color,'ceramic'));cyl(g,.055,.055,.02,0,.18,0,body);cyl(g,.012,.012,.025,0,.2,0,black);tube(g,[.07,.09,0],[.16,.17,0],.017,body);torus(g,.08,.012,-.08,.11,0,black);break;
    }
    case 'bed':{
      legs(g,1.55,1.8,.15,darkwood);box(g,1.8,.28,2.1,0,.27,0,fabric,.075);box(g,1.8,.9,.15,0,.6,-.97,fabric,.08);
      box(g,1.71,.22,1.96,0,.49,.02,material('#e9e3d7','cloth'),.09);
      box(g,1.74,.08,1.25,0,.64,.4,fabric,.045);for(const x of [-.43,.43]){const p=box(g,.65,.17,.44,x,.66,-.62,material('#eee7da','cloth'),.08);p.rotation.y=x*.14;}
      for(let i=0;i<14;i++)box(g,.035,.006,1.13,-.82+i*.126,.685,.4,material(color,'cloth'),.003);break;
    }
    case 'toilet':{
      ball(g,0,.19,.08,.15,.21,.22,white);ball(g,0,.39,.08,.215,.1,.31,white);const ring=torus(g,.16,.032,0,.47,.12,white,Math.PI/2);ring.scale.y=1.3;
      box(g,.4,.41,.18,0,.59,-.23,white,.06);box(g,.42,.04,.2,0,.81,-.23,white,.025);cyl(g,.025,.025,.012,.1,.837,-.23,metal);break;
    }
    case 'bath':{
      const outer=ball(g,0,.32,0,.825,.3,.39,material(color,'ceramic'));
      const inner=ball(g,0,.49,0,.71,.12,.31,material('#d3d9cf','ceramic'));
      const rim=new C.Shape();rim.absellipse(0,0,.8,.37,0,Math.PI*2,false,0);const hole=new C.Path();hole.absellipse(0,0,.71,.29,0,Math.PI*2,true,0);rim.holes.push(hole);
      mesh(g,sharedGeometry('bath-rim',()=>new C.ExtrudeGeometry(rim,{depth:.035,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2,steps:1})),white,0,.56,0,Math.PI/2);
      tube(g,[.6,.05,-.45],[.6,.78,-.45],.018,metal);tube(g,[.6,.78,-.45],[.6,.78,-.24],.018,metal);break;
    }
    case 'vanity':{
      box(g,.95,.52,.48,0,.54,0,material(color,'wood'));for(const x of [-.23,.23])box(g,.44,.46,.02,x,.55,.25,wood,.005);
      box(g,1,.05,.53,0,.82,0,top,.012);ball(g,0,.87,0,.31,.065,.19,white);tube(g,[0,.83,-.2],[0,1.08,-.2],.014,metal);tube(g,[0,1.08,-.2],[0,1.08,-.06],.014,metal);break;
    }
    case 'shower':{
      box(g,.95,.065,.95,0,.033,0,top);box(g,.014,2.1,.95,-.47,1.1,0,material('#c3d6cd','glass'),0);box(g,.95,2.1,.014,0,1.1,-.47,material('#c3d6cd','glass'),0);
      tube(g,[.4,.05,-.4],[.4,2.08,-.4],.012,metal);tube(g,[.4,2.08,-.4],[.1,2.08,-.4],.015,metal);cyl(g,.13,.13,.025,.1,2.06,-.4,metal);break;
    }
    case 'towelrack':{
      for(const x of [-.28,.28]){tube(g,[x,0,-.12],[x,.9,-.12],.014,metal);tube(g,[x,0,.12],[x,.9,-.12],.012,metal);}tube(g,[-.28,.89,-.12],[.28,.89,-.12],.014,metal);
      box(g,.4,.53,.025,0,.6,-.1,material('#ddd2bb','cloth'),.01);for(let i=0;i<14;i++)box(g,.008,.5,.027,-.18+i*.028,.6,-.085,material('#e6ddc8','cloth'),.003);break;
    }
    default:{const helpers={box,cyl,ball,tube,torus,legs,material,mesh,createModel:(nested,c)=>createModel(nested,c,appearance,undefined,false),part,color,appearance};if(!buildOutdoorModel(g,def,helpers)&&!buildDesignModel(g,def,helpers)&&!buildCollectionModel(g,def,helpers)&&!buildHobbyModel(g,def,helpers)&&!buildHomeModel(g,def,helpers))throw new Error(`Unknown furniture model: ${def.model}`);}
  }
  const parts=collectParts(g,def);
  const collisionBoxes=optimize&&(def.model.startsWith('design-')||def.outdoor)&&!def.small&&!def.rug&&!def.ceiling&&(!def.wall||def.wallSupport)?captureCollisionBoxes(g):null;
  if(optimize)batchModel(g);
  g.userData.appearanceParts=parts;
  if(def.fit){
    const bounds=new C.Box3().setFromObject(g),size=bounds.getSize(new C.Vector3()),center=bounds.getCenter(new C.Vector3());
    const scale=new C.Vector3(...def.size).divide(size);g.scale.copy(scale);
    g.position.set(-center.x*scale.x,-bounds.min.y*scale.y,-center.z*scale.z);
    const fitted=new C.Group();fitted.add(g);fitted.userData.definition=def;fitted.userData.appearanceParts=parts;fitted.userData.collisionBoxes=fitCollisionBoxes(collisionBoxes,g);return fitted;
  }
  g.userData.definition=def;
  g.userData.collisionBoxes=fitCollisionBoxes(collisionBoxes,g);
  return g;
}

export const primitives={box,cyl,ball,tube};
