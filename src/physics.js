import * as CANNON from 'cannon-es';

export function createWorld(width, depth, partitions) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.81, 0), allowSleep: true });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.defaultContactMaterial.friction = .65;
  world.defaultContactMaterial.restitution = .025;
  const addBox = (w,h,d,x,y,z) => {
    const b = new CANNON.Body({ mass:0, shape:new CANNON.Box(new CANNON.Vec3(w/2,h/2,d/2)), position:new CANNON.Vec3(x,y,z) }); world.addBody(b);
  };
  addBox(width, .2, depth, 0, -.1, 0);
  addBox(width, 3.3, .14, 0, 1.65, -depth/2);
  addBox(width, 3.3, .14, 0, 1.65, depth/2);
  addBox(.14, 3.3, depth, -width/2, 1.65, 0);
  addBox(.14, 3.3, depth, width/2, 1.65, 0);
  if(partitions){addBox(.14,3,depth*.42,1.45,1.5,-depth*.29);addBox(.14,3,depth*.18,1.45,1.5,depth*.41);addBox(width/2-1.45,3,.14,(1.45+width/2)/2,1.5,.45);}
  return world;
}

export function createBody(def, item) {
  if(def.rug || def.ceiling || def.wall) return null;
  const s=item.scale;
  const body = new CANNON.Body({mass:def.small?.4:0,allowSleep:true,sleepSpeedLimit:.08,sleepTimeLimit:.7,linearDamping:.6,angularDamping:.8});
  const add=(w,h,d,x=0,y=h/2,z=0)=>body.addShape(new CANNON.Box(new CANNON.Vec3(w*s/2,h*s/2,d*s/2)),new CANNON.Vec3(x*s,y*s,z*s));
  if(def.model==='shelf') {
    for(const x of [-.77,0,.77])add(.055,2,.36,x,1);
    for(let i=0;i<5;i++)add(1.6,.045,.36,0,.43+i*.46);
    for(const x of [-.67,.67])add(.08,.41,.3,x,.205);
  }else if(['coffee','dining','desk','side'].includes(def.model)){
    const[w,h,d]=def.size;add(w,.065,d,0,h-.0325);add(w*.35,h-.065,d*.35,0,(h-.065)/2);
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
