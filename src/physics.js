import * as CANNON from 'cannon-es';
import {itemDefinition,wallSections} from './architecture.js';
import {floorTriangles,planGeometry,wallSectionsForPlan} from './floor-plans.js';

export function createWorld(width, depth, partitions) {
  const layout=typeof width==='object'?width:null;if(layout){width=layout.width;depth=layout.depth;partitions=layout.partitions;}
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.81, 0), allowSleep: true });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.defaultContactMaterial.friction = .65;
  world.defaultContactMaterial.restitution = .025;
  const addBox = (w,h,d,x,y,z) => {
    const b = new CANNON.Body({ mass:0, shape:new CANNON.Box(new CANNON.Vec3(w/2,h/2,d/2)), position:new CANNON.Vec3(x,y,z) }); world.addBody(b);
  };
  if(layout?.plan){
    const floor=new CANNON.Body({mass:0});
    for(const points of floorTriangles(layout.plan)){
      const cx=points.reduce((s,p)=>s+p[0],0)/3,cz=points.reduce((s,p)=>s+p[1],0)/3;
      const vertices=[...points.map(([x,z])=>new CANNON.Vec3(x-cx,-.1,z-cz)),...points.map(([x,z])=>new CANNON.Vec3(x-cx,.1,z-cz))];
      floor.addShape(new CANNON.ConvexPolyhedron({vertices,faces:[[0,1,2],[3,5,4],[0,3,4,1],[1,4,5,2],[2,5,3,0]]}),new CANNON.Vec3(cx,-.1,cz));
    }world.addBody(floor);
    for(const segment of planGeometry(layout.plan).segments){const body=new CANNON.Body({mass:0});for(const s of wallSectionsForPlan(segment.style,segment.length)){body.addShape(new CANNON.Box(new CANNON.Vec3(s.width/2,s.height/2,s.depth/2)),new CANNON.Vec3(s.x,s.y,s.z));}if(body.shapes.length){body.position.set(segment.mid[0],0,segment.mid[1]);body.quaternion.setFromEuler(0,segment.rotation,0);world.addBody(body);}}
    return world;
  }
  addBox(width, .2, depth, 0, -.1, 0);
  addBox(width, 3.3, .14, 0, 1.65, -depth/2);
  addBox(width, 3.3, .14, 0, 1.65, depth/2);
  addBox(.14, 3.3, depth, -width/2, 1.65, 0);
  addBox(.14, 3.3, depth, width/2, 1.65, 0);
  if(partitions){addBox(.14,3,depth*.42,1.45,1.5,-depth*.29);addBox(.14,3,depth*.18,1.45,1.5,depth*.41);addBox(width/2-1.45,3,.14,(1.45+width/2)/2,1.5,.45);}
  return world;
}

export function createBody(def, item,collisionBoxes) {
  def=itemDefinition(def,item);
  if(def.rug || def.ceiling || (def.wall&&!def.wallSupport)) return null;
  const s=item.scale;
  const body = new CANNON.Body({mass:def.small?.4:0,allowSleep:true,sleepSpeedLimit:.08,sleepTimeLimit:.7,linearDamping:.6,angularDamping:.8});
  const add=(w,h,d,x=0,y=h/2,z=0)=>body.addShape(new CANNON.Box(new CANNON.Vec3(w*s/2,h*s/2,d*s/2)),new CANNON.Vec3(x*s,y*s,z*s));
  if(collisionBoxes?.length&&!def.small){
    for(const box of collisionBoxes)add(...box.size,...box.center);
  }else if(def.architecture){
    for(const b of wallSections(def))add(b.width,b.height,b.depth,b.x,b.y,b.z);
  }else if(['design-chair','diningchair','cane-chair'].includes(def.model)){
    const[w,h,d]=def.size;add(w*.92,.07,d*.85,0,.46);
    add(w*.84,Math.max(.1,h-.52),.065,0,(h+.52)/2,-d*.36);
    for(const x of [-w*.39,w*.39])for(const z of [-d*.34,d*.34])add(.035,.43,.035,x,.215,z);
    if(def.design?.arms)for(const x of [-w*.47,w*.47])add(.04,.04,d*.55,x,.68);
  }else if(def.tableSupport){
    const[w,h,d]=def.size;add(w,.07,d,0,h-.035);for(const x of [-w*.35,w*.35])add(.06,h-.07,d*.65,x,(h-.07)/2);
  }else if(def.shelfSupport){
    const[w,h,d]=def.size,levels=['low','wall'].includes(def.design?.form)?2:4;
    if(def.design?.form==='stepped'){
      for(let i=0;i<4;i++){const height=h*(i+1)/4,x=-w/2+(i+.5)*w/4;for(const xx of [x-w/8,x+w/8])add(.035,height,d,xx,height/2);for(let j=0;j<=i+1;j++)add(w/4,.035,d,x,j*height/(i+1));}
    }else if(def.design?.form==='corner'){
      for(const[x,z]of[[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2]])add(.045,h,.045,x,h/2,z);
      for(let i=0;i<=levels;i++){const y=.03+i*(h-.06)/levels;add(w,.035,d*.48,0,y,-d*.26);add(w*.48,.035,d,-w*.26,y,0);}
    }else{for(const x of [-w/2+.02,w/2-.02])add(.04,h,d,x,h/2);for(let i=0;i<=levels;i++)add(w,.035,d,0,.025+i*(h-.05)/levels);}
  }else if(def.model==='smallplant'){
    // Foliage is flexible: collide with the pot, not a solid box around leaves.
    // The old box wedged against the next shelf and never allowed sleep.
    add(.13,.12,.13,0,.06);
  }else if(def.model==='wall-shelf'){
    const[w,h,d]=def.size;add(w,.035,d,0,h-.0175);
  }else if(def.model==='shelf') {
    for(const x of [-.77,0,.77])add(.055,2,.36,x,1);
    for(let i=0;i<5;i++)add(1.6,.045,.36,0,.43+i*.46);
    for(const x of [-.67,.67])add(.08,.41,.3,x,.205);
  }else if(['book-cart','supply-cart','bakers-rack','grow-stand'].includes(def.model)){
    const[w,h,d]=def.size,levels=def.model==='bakers-rack'?4:3;
    for(const x of [-w*.44,w*.44])for(const z of [-d*.4,d*.4])add(.04,h,.04,x,h/2,z);
    for(let i=0;i<levels;i++)add(w,.035,d,0,.12+i*(h-.25)/(levels-1));
  }else if(['open-shelf','ladder-shelf','cube-shelf','shoe-rack','glass-cabinet'].includes(def.model)){
    const[w,h,d]=def.size;
    const levels=def.model==='shoe-rack'?2:def.model==='cube-shelf'?3:def.model==='ladder-shelf'?5:def.model==='glass-cabinet'?3:Math.max(2,Math.round(h/.4));
    for(const x of [-w/2+.025,w/2-.025])add(.05,h,d,x,h/2);
    for(let i=0;i<=levels;i++)add(w,.035,d,0,.025+i*(h-.05)/levels);
    if(def.model==='cube-shelf')for(const x of [-w/6,w/6])add(.035,h,d,x,h/2);
  }else if(['coffee','dining','desk','side','rect-table','trestle','glass-table','bistro','c-table'].includes(def.model)){
    const[w,h,d]=def.size;add(w,.065,d,0,h-.0325);add(w*.35,h-.065,d*.35,0,(h-.065)/2);
  }else if(def.model==='nesting'){
    add(.67,.04,.65,-.23,.48);add(.53,.04,.53,.32,.35);add(.15,.46,.15,-.23,.23);add(.12,.33,.12,.32,.165);
  }else if(def.model==='island'||def.model==='kitchen') {
    const[w,h,d]=def.size;add(w,h,d);
  }else if(def.model==='shower') {add(.95,.065,.95);add(.025,2.1,.95,-.47,1.1);add(.95,2.1,.025,0,1.1,-.47);}
  else {const[w,h,d]=def.size;add(w*.96,h*.96,d*.96,0,h*.49);}
  body.position.set(item.x,item.y,item.z);
  body.quaternion.setFromEuler(0,item.rotation,0);
  body.fixedRotation=true;body.updateMassProperties();
  return body;
}

// Use the same compound colliders for placement and simulation. In particular,
// a bookcase is open between shelves, and tables have space below their tops.
export function canPlaceBody(world, body, others) {
  body.updateAABB();
  for(const other of others) {
    if(other.aabbNeedsUpdate)other.updateAABB();
    if(!body.aabb.overlaps(other.aabb))continue;
    const contacts=[],friction=[];
    world.narrowphase.getContacts([body],[other],world,contacts,[],friction,[]);
    for(const contact of contacts) {
      const a=contact.bi.position.vadd(contact.ri),b=contact.bj.position.vadd(contact.rj);
      if(b.vsub(a).dot(contact.ni)<-.025)return false;
    }
  }
  return true;
}
