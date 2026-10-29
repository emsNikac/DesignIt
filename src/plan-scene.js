import * as THREE from 'three';
import {primitives,material,makeTexture} from './models.js';
import {floorSurface,floorTextureType,FLOOR_TYPES} from './floors.js';
import {OUTDOOR_SURFACES,planGeometry,wallSectionsForPlan,cutawayWall} from './floor-plans.js';
import {bathTileColor} from './tiles.js';
import {roomLightPositions} from './lighting.js';
const {box,cyl}=primitives;

export function polygonShape(poly){
  const path=(ring,Shape)=>{const p=new Shape();ring.forEach(([x,z],i)=>i?p.lineTo(x,-z):p.moveTo(x,-z));p.closePath();return p;};
  const shape=path(poly[0],THREE.Shape);shape.holes=poly.slice(1).map(r=>path(r,THREE.Path));return shape;
}
function floorMesh(poly,mat,y,depth=0){
  const shape=polygonShape(poly),geometry=depth?new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}):new THREE.ShapeGeometry(shape);
  const {position,uv}=geometry.attributes;for(let i=0;i<uv.count;i++)uv.setXY(i,position.getX(i)/4,position.getY(i)/4);
  const mesh=new THREE.Mesh(geometry,mat);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.receiveShadow=true;mesh.castShadow=!!depth;return mesh;
}
export function finishMaterial(color,finish='paint'){
  const type=finish==='paint'?'matte':finish,m=material(color,type).clone();if(finish==='tile'||finish==='stone'){const map=makeTexture(finish==='tile'?'tile':'slate',color);m.color.set('#ffffff');m.map=map;m.bumpMap=map;m.bumpScale=.012;m.roughness=finish==='tile'?.3:.9;}m.userData.sharedTextures=true;return m;
}
export function buildPlanRoom(layout,design){
  const room=new THREE.Group(),walls=[],planWallGroups=new Map(),walkEnvelope=new THREE.Group(),ceilingMaterials=[],g=planGeometry(layout.plan);
  room.add(walkEnvelope);
  for(const poly of g.union)room.add(floorMesh(poly,material('#c7c1b2'),-.2,.18));
  for(const area of g.floors){
    if(!area.polygons.length)continue;
    const {region:r}=area;
    const outdoor=r.type!=='indoor',override=design.zoneSurfaces?.[r.id],surface=OUTDOOR_SURFACES.find(s=>s.id===(override||r.surface))||OUTDOOR_SURFACES.find(s=>s.id===(r.type==='garden'?'grass':r.type==='path'?'gravel':'deck'));
    const f=FLOOR_TYPES.find(f=>f.id===design.floor)||FLOOR_TYPES[0];
    const type=outdoor?(surface.id==='deck'?'floor':surface.id==='pavers'?'tile':surface.id):r.use==='bathroom'?'tile':floorTextureType(f),color=outdoor?surface.color:r.use==='bathroom'?bathTileColor(design.bathTile):f.color;
    const tex=makeTexture(type,color),m=new THREE.MeshStandardMaterial({map:tex,bumpMap:tex,...(outdoor?{roughness:.9,bumpScale:.015}:floorSurface(f))});m.userData.sharedTextures=true;
    for(const poly of area.polygons){const mesh=floorMesh(poly,m,.004);mesh.userData.ownedMaterial=true;room.add(mesh);if(!outdoor){const ceiling=floorMesh(poly,material('#e7e2d4'),3.08);ceiling.material=ceiling.material.clone();ceiling.material.side=THREE.DoubleSide;ceiling.userData.ownedMaterial=true;ceiling.castShadow=true;walkEnvelope.add(ceiling);}}
  }
  for(const segment of g.segments){
    if(segment.style==='open')continue;
    const timber=['slatted','fence'].includes(segment.style),glass=segment.style==='glass',base=glass?'#b2cbc6':timber?'#a38b64':design.wallColor,finish=design.wallFinishes?.[segment.id]||{},type=glass?'glass':finish.finish||(timber?'wood':'paint');
    const group=new THREE.Group(),a=finishMaterial(finish.a||base,type),b=finishMaterial(finish.b||base,type),core=finishMaterial(base,type),parts=wallSectionsForPlan(segment.style,segment.length+.04);
    const sides=[core,core,core,core,a,b];
    if(segment.style==='slatted'||segment.style==='fence'){
      const h=segment.style==='fence'?1.05:3;
      for(let x=-segment.length/2;x<segment.length/2+.01;x+=.16){const mesh=box(group,.065,h,.07,x,h/2,0,sides,0);mesh.userData.ownedMaterial=true;}
      for(const y of [.2,h-.2]){const mesh=box(group,segment.length+.04,.065,.09,0,y,0,sides,0);mesh.userData.ownedMaterial=true;}
    }else{
      for(const section of parts){
        const mesh=box(group,section.width,section.height,section.depth,section.x,section.y,section.z,section.part==='glass'&&!glass?material('#b2cbc6','glass'):sides,0);
        if(section.part==='glass')mesh.castShadow=false;if(section.part!=='glass'||glass)mesh.userData.ownedMaterial=true;
      }
      if(['window','glass'].includes(segment.style)){
        const height=segment.style==='window'?1.8:3,bottom=segment.style==='window'?.85:0,w=segment.style==='window'?segment.length*.72:segment.length,frame=material('#657062','metal');
        for(const x of [-w/2,w/2])box(group,.035,height,.06,x,bottom+height/2,0,frame,.002);
        for(const y of [bottom,bottom+height])box(group,w,.035,.06,0,y,0,frame,.002);
        for(let x=-w/2+1;x<w/2-.1;x+=1)box(group,.025,height,.04,x,bottom+height/2,0,frame,.002);
      }
      if(segment.style==='solid'||segment.style==='window')box(group,segment.length,.09,.04,0,.045,.085,material('#e9e5d8'),.003);
    }
    group.position.set(segment.mid[0],0,segment.mid[1]);group.rotation.y=segment.rotation;
    group.userData.cutaway=cutawayWall(segment,layout.plan.cutaway);group.userData.planWallId=segment.id;
    group.traverse(mesh=>{mesh.userData.planWallId=segment.id;mesh.userData.keepInterior=segment.interior;});
    group.visible=!group.userData.cutaway;room.add(group);walls.push(group);planWallGroups.set(segment.id,group);
  }
  for(const [x,y,z] of roomLightPositions(layout)){
    const m=new THREE.MeshStandardMaterial({color:'#eee8d6',emissive:'#ffe2b5',emissiveIntensity:design.lightsOn===false?0:.6});ceilingMaterials.push(m);const fixture=cyl(walkEnvelope,.14,.14,.025,x,y+.14,z,m);fixture.userData.ownedMaterial=true;
  }
  walkEnvelope.visible=false;return {room,walls,walkEnvelope,ceilingMaterials,planWallGroups};
}
