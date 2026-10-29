import {designHelpers} from './design-geometry.js';

export function buildOutdoorModel(g,def,helpers){
  if(!def.model.startsWith('outdoor-'))return false;
  const h=designHelpers(helpers),{box,cyl,ball,tube,torus,part,panel,arc}=h,F=def.design.form;
  const wood=part('frame',h.color,'wood'),body=part('body',h.color,'matte'),metal=part('hardware','#424c43','metal'),stone=part('ceramic','#b7b3a2','stone'),fabric=part('accent','#d8d0b6','cloth'),glass=part('glass','#bed6cf','glass'),leaf=part('foliage','#62814b'),flower=part('details','#cf9877'),water=part('top','#668f91','lacquer'),glow=part('shade','#ffe0a0','glow');
  const plankSeat=(x,y,z,w=1.6,d=.5)=>{for(let i=0;i<6;i++)box(g,w,.055,d/6-.008,x,y,z-d/2+(i+.5)*d/6,wood,.008);};
  const posts=(w,d,height)=>{for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])box(g,.09,height,.09,x,height/2,z,wood,.008);};
  const wheel=(x,y,z,r=.16)=>{const o=cyl(g,r,r,.06,x,y,z,metal,24);o.rotation.x=Math.PI/2;};
  const foliage=(x,y,z,r=.28)=>{ball(g,x,y,z,r,r*.8,r,leaf);for(let i=0;i<6;i++){const a=i*Math.PI/3;ball(g,x+Math.cos(a)*r*.65,y+r*.2,z+Math.sin(a)*r*.65,r*.52,r*.5,r*.52,leaf);}};
  const bowl=(y,r,m)=>{cyl(g,r,r*.8,.12,0,y,0,m);torus(g,r,.035,0,y+.07,0,m,Math.PI/2);};
  if(def.model==='outdoor-seat'){
    if(F==='hammock'){
      for(const x of [-1.1,1.1]){tube(g,[x,-.02,-.4],[x,.1,.4],.05,wood);tube(g,[x,.05,0],[x*1.13,1.2,0],.06,wood);}arc(g,[[-1.3,1.2,0],[-.7,.52,0],[.7,.52,0],[1.3,1.2,0]],.025,metal);
      for(let i=0;i<14;i++){const x=-.95+i*.146,y=.48+.35*(x*x);box(g,.13,.04,.8,x,y,0,fabric,.025);}return true;
    }
    if(F==='daybed'||F==='swing'){
      posts(2,1,2.1);plankSeat(0,F==='swing'?.65:.35,0,1.85,.9);box(g,1.8,.18,.85,0,F==='swing'?.75:.48,0,fabric,.06);box(g,1.8,.4,.1,0,1,-.45,fabric);
      if(F==='daybed'){box(g,2.2,.06,1.3,0,2.16,0,fabric);for(const x of [-1,1])box(g,.04,1.7,1.1,x,1.25,0,fabric);}
      else for(const x of [-.85,.85])for(const z of [-.4,.4])tube(g,[x,2.1,z],[x,.65,z],.015,metal);return true;
    }
    if(F==='stump'){cyl(g,.4,.44,.55,0,.275,0,wood,18);for(let i=0;i<9;i++){const a=i*7;box(g,.05,.5,.04,Math.cos(a)*.39,.26,Math.sin(a)*.39,body);}return true;}
    if(F==='curvedbench'){panel(g,'kidney',2,.9,.14,.45,wood);for(const x of [-.7,.7])box(g,.18,.42,.45,x,.21,0,stone);return true;}
    if(F==='sectional'){box(g,2.3,.28,.85,0,.32,-.45,wood);box(g,.85,.28,1.9,-.73,.32,.1,wood);for(let i=0;i<3;i++)box(g,.7,.18,.75,-.75+i*.75,.55,-.4,fabric,.06);box(g,.75,.18,.9,-.73,.55,.55,fabric,.06);box(g,2.3,.45,.12,0,.75,-.87,wood);box(g,.12,.45,1.9,-1.12,.75,.1,wood);return true;}
    const wide=F==='parkbench',w=wide?1.8:.65,d=F==='sling'?1.65:.65;
    for(const x of [-w*.4,w*.4])for(const z of [-d*.38,d*.38])tube(g,[x,.02,z],[x*.85,.48,z*.85],.035,wide?metal:wood);
    if(F==='sling'){const seat=box(g,.62,.05,1.45,0,.5,0,fabric);seat.rotation.x=-.17;for(const x of [-.37,.37])tube(g,[x,.35,.78],[x,.85,-.7],.035,wood);}
    else{plankSeat(0,.48,0,w,d);for(const x of [-w*.44,w*.44])tube(g,[x,.3,-d*.37],[x,1.08,-d*.55],.035,wood);for(let i=0;i<(F==='adirondack'?7:4);i++){const x=-w*.43+i*w*.86/((F==='adirondack'?7:4)-1);box(g,w/(F==='adirondack'?8:5),.54,.045,x,.84,-d*.45,wood,.015);}if(F!=='bistro')for(const x of [-w*.55,w*.55])box(g,.09,.05,.72,x,.73,-.02,wood);else{tube(g,[-.3,.1,.3],[.3,.8,-.3],.02,metal);tube(g,[.3,.1,.3],[-.3,.8,-.3],.02,metal);}}return true;
  }
  if(def.model==='outdoor-boundary'){
    for(const x of [-1,1]){box(g,.1,1.6,.1,x,.8,0,wood);ball(g,x,1.64,0,.07,.07,.07,metal);}
    if(F==='glassrail')box(g,1.85,1.1,.025,0,.65,0,glass,.003);
    else if(F==='stone'||F==='brick'){for(let row=0;row<5;row++)for(let col=0;col<7;col++)box(g,.28,.19,.28,-.9+col*.29+(row%2)*.03,.12+row*.2,0,F==='brick'?part('body','#b37b60','matte'):stone,.018);}
    else if(F==='horizontal')for(let i=0;i<8;i++)box(g,2,.14,.06,0,.2+i*.19,0,wood,.006);
    else if(F==='rope'){for(const y of [.35,.8,1.25])arc(g,[[-1,y,0],[-.5,y-.12,0],[.5,y-.12,0],[1,y,0]],.018,fabric);}
    else if(F==='wire'){for(let i=0;i<15;i++)tube(g,[-.95+i*.135,.1,0],[-.95+i*.135,1.5,0],.005,metal);for(let i=0;i<10;i++)tube(g,[-1,.15+i*.14,0],[1,.15+i*.14,0],.005,metal);}
    else if(F==='lattice'){for(let i=-6;i<=6;i++){const x=i*.16;tube(g,[Math.max(-1,x-.6),.1,0],[Math.min(1,x+.6),1.5,0],.018,wood);tube(g,[Math.max(-1,x-.6),1.5,.02],[Math.min(1,x+.6),.1,.02],.018,wood);}}
    else{for(const y of [.3,1.1])box(g,2,.06,.07,0,y,.03,wood);for(let i=0;i<11;i++){const x=-.9+i*.18,h=F==='gate'?1.15+.35*Math.cos(x):F==='picket'?1.2:1.55;box(g,.115,h,.055,x,h/2,0,wood,.006);if(F==='picket'){const cap=cyl(g,.08,0,.14,x,h+.07,0,wood,4);cap.rotation.y=Math.PI/4;}}if(F==='gate'){tube(g,[-.95,.18,.08],[.95,1.35,.08],.025,metal);ball(g,.72,.8,.09,.045,.045,.045,metal);}}return true;
  }
  if(def.model==='outdoor-shelter'){
    if(F==='umbrella'||F==='sail'){
      const sail=F==='sail';for(const x of sail?[-1.3,1.3]:[1])tube(g,[x,0,-.6],[x,2.5,-.6],.035,metal);if(sail)tube(g,[0,0,1.2],[0,2.1,1.2],.035,metal);
      const canopy=panel(g,sail?'triangle':'octagon',2.8,2.8,.035,2.4,fabric);canopy.rotation.z=.09;for(let i=0;i<8;i++){const a=i*Math.PI/4;tube(g,[0,2.45,0],[Math.cos(a)*1.3,2.4,Math.sin(a)*1.3],.012,metal);}box(g,.7,.08,.7,1,.04,-.6,stone);return true;
    }
    if(F==='trellis'||F==='screen'){const count=F==='screen'?3:1;for(let j=0;j<count;j++){const x=(j-(count-1)/2)*.8;for(const dx of [-.38,.38])box(g,.06,2,.07,x+dx,1,0,wood);for(let i=0;i<8;i++){tube(g,[x-.35,.1+i*.2,0],[x+.35,.5+i*.2,0],.018,wood);tube(g,[x-.35,.5+i*.2,.02],[x+.35,.1+i*.2,.02],.018,wood);}}return true;}
    const arched=F==='arch'||F==='arbor',w=arched?1.6:3,d=arched?.65:2.6;
    posts(w,d,arched?2.1:2.5);
    if(arched){for(const z of [-d/2,d/2])arc(g,[[-w/2,2.1,z],[-w*.35,2.65,z],[w*.35,2.65,z],[w/2,2.1,z]],.055,wood);for(let i=0;i<7;i++)box(g,w,.055,.055,0,.4+i*.24,-d/2,wood);if(F==='arbor')plankSeat(0,.5,0,1.6,.65);return true;}
    if(F==='gazebo'){panel(g,'octagon',3.6,3.6,.1,2.5,wood);const roof=cyl(g,0,2.25,.8,0,2.9,0,body,8);roof.rotation.y=Math.PI/8;for(let i=0;i<8;i++){const a=i*Math.PI/4;box(g,.07,2.5,.07,Math.cos(a)*1.5,1.25,Math.sin(a)*1.5,wood);}return true;}
    for(const x of [-w/2,w/2])box(g,.1,.15,d+.25,x,2.5,0,wood);
    if(F==='greenhouse'||F==='shed'){for(const x of [-1.5,1.5])box(g,.025,2.4,2.6,x,1.25,0,glass);box(g,3,2.4,.025,0,1.25,-1.3,glass);for(const x of [-.8,.8])box(g,.8,2.4,.025,x,1.25,1.3,glass);for(const x of [-.8,0,.8])tube(g,[x,2.5,-1.3],[x,3,0],.035,metal);for(const z of [-.65,.65]){const roof=box(g,3,.025,1.55,0,2.75,z,glass);roof.rotation.x=z>0?-.4:.4;}}
    else if(F==='canopy'){box(g,3.4,.06,2.8,0,2.55,0,fabric);for(let i=0;i<9;i++)box(g,.15,.065,2.8,-1.4+i*.35,2.59,0,part('details','#89936a','cloth'));}
    else for(let i=0;i<9;i++)box(g,3.4,.12,.08,0,2.55,-1.2+i*.3,wood);return true;
  }
  if(def.model==='outdoor-plant'){
    if(F==='hedge'){box(g,1.8,.9,.65,0,.55,0,leaf,.16);for(let i=0;i<8;i++)foliage(-.78+i*.22,.9,0,.18);return true;}
    if(F==='flowers'||F==='vegetables'){const w=F==='flowers'?1.2:1.8,d=F==='flowers'?.45:1.2;box(g,w,.45,d,0,.25,0,wood);box(g,w*.95,.03,d*.9,0,.49,0,part('body','#514b35'));for(let i=0;i<16;i++){const x=(i%4-1.5)*w/5,z=(Math.floor(i/4)-1.5)*d/5;foliage(x,.62,z,.12);if(F==='flowers')ball(g,x,.76,z,.09,.04,.09,flower);}return true;}
    if(F==='bamboo'){box(g,1,.35,.6,0,.175,0,stone);for(let i=0;i<9;i++){const x=(i%3-1)*.3,z=(Math.floor(i/3)-1)*.17;const height=1.7+(i%3)*.25;cyl(g,.025,.035,height,x,height/2,z,wood);for(let j=1;j<6;j++){torus(g,.03,.007,x,j*.3,z,wood,Math.PI/2);ball(g,x+.13,j*.3+.1,z,.19,.02,.06,leaf);}}return true;}
    if(F==='rose'){for(const x of [-.6,.6])box(g,.04,2,.05,x,1,0,wood);for(let j=0;j<8;j++){box(g,1.2,.025,.03,0,.2+j*.24,0,wood);foliage(Math.sin(j*2)*.45,.25+j*.23,0,.18);ball(g,Math.cos(j)*.4,.3+j*.23,.08,.09,.08,.09,flower);}return true;}
    if(F==='hanging'){cyl(g,.32,.22,.25,0,.2,0,wood);for(const x of [-.25,.25])tube(g,[x,.3,0],[0,1,0],.007,metal);for(let i=0;i<10;i++){const a=i*2.4;foliage(Math.cos(a)*.22,.32,Math.sin(a)*.22,.13);ball(g,Math.cos(a)*.25,.35,Math.sin(a)*.25,.08,.04,.08,flower);}return true;}
    const palm=F==='palm',conifer=F==='conifer',topiary=F==='topiary';
    cyl(g,.08,.14,topiary?1.3:2,0,topiary?.65:1,0,wood,16);
    if(conifer)for(let i=0;i<5;i++)cyl(g,0,1-i*.16,.9,0,.8+i*.43,0,leaf,16);
    else if(palm)for(let i=0;i<12;i++){const a=i*Math.PI/6;arc(g,[[0,2,0],[Math.cos(a)*.65,2.4,Math.sin(a)*.65],[Math.cos(a)*1.1,1.9,Math.sin(a)*1.1]],.045,leaf);}
    else if(topiary){cyl(g,.3,.22,.35,0,.175,0,stone);for(let i=0;i<18;i++){const a=i*.8;ball(g,Math.cos(a)*.2,.5+i*.07,Math.sin(a)*.2,.16,.13,.16,leaf);}}
    else{foliage(0,2,0,1);foliage(-.7,1.8,.3,.65);foliage(.6,2.1,-.35,.75);}return true;
  }
  if(def.model==='outdoor-ground'){
    if(F==='steps'||F==='flagstone'){for(let i=0;i<(F==='steps'?6:12);i++){const x=F==='steps'?Math.sin(i)*.1:(i%3-1)*.6,z=F==='steps'?-1+i*.4:(Math.floor(i/3)-1.5)*.4;cyl(g,.25,.27,.06,x,.03,z,stone,F==='steps'?7:5);}return true;}
    if(F==='roundgrass')panel(g,'round',2,2,.02,.025,part('body','#6f874e','grass'));
    else if(F==='curve'){arc(g,[[-1.1,.04,-1.1],[-.8,.04,.5],[.5,.04,.8],[1.1,.04,1.1]],.35,part('body','#626967','stone'));}
    else if(F==='deck'){for(let i=0;i<12;i++)box(g,2.4,.12,.18,0,.08,-1.1+i*.2,wood,.006);}
    else if(F==='brickpath'||F==='stonepath'){for(let row=0;row<10;row++)for(let col=0;col<3;col++)box(g,.3,.035,.24,(col-1)*.32,.02,-1.15+row*.25,F==='brickpath'?part('body','#aa7b61'):stone,.007);}
    else{panel(g,F==='gravel'?'kidney':'rectangle',2,2,.025,.025,part('body',F==='grass'?'#6f874e':F==='road'?'#626967':'#b9ad94',F==='grass'?'grass':F==='gravel'?'gravel':'stone'));if(F==='road')for(let i=0;i<5;i++)box(g,.035,.002,.22,0,.04,-.8+i*.4,part('details','#e4d6a2'),0);}return true;
  }
  if(def.model==='outdoor-amenity'){
    if(F==='fountain'||F==='birdbath'){cyl(g,.32,.4,.12,0,.06,0,stone);cyl(g,.1,.16,.75,0,.48,0,stone);bowl(.9,F==='birdbath'?.4:.7,stone);cyl(g,.34,.34,.015,0,.98,0,water);if(F==='fountain'){cyl(g,.06,.09,.6,0,1.2,0,stone);bowl(1.5,.35,stone);ball(g,0,1.7,0,.08,.1,.08,water);}return true;}
    if(F==='firepit'||F==='hottub'||F==='pond'){
      const hot=F==='hottub',pond=F==='pond',radius=hot?1:pond?1.1:.65,levels=hot?3:1;
      for(let row=0;row<levels;row++)for(let i=0;i<18;i++){const a=i*Math.PI/9;const block=box(g,.26,hot?.3:.18,.18,Math.cos(a)*radius,(hot?.15:.1)+row*.3,Math.sin(a)*radius,hot?wood:stone,.02);block.rotation.y=-a;}
      cyl(g,radius*.87,radius*.87,.03,0,hot?.78:.08,0,F==='firepit'?metal:water);
      if(F==='firepit'){for(let i=0;i<5;i++)tube(g,[-.3,.18,-.2+i*.1],[.3,.2,.15-i*.06],.045,wood);for(let i=0;i<4;i++)ball(g,Math.sin(i)*.15,.32,Math.cos(i)*.15,.07,.2,.07,glow);}
      if(pond)for(let i=0;i<6;i++){const a=i*2.4;cyl(g,.14,.14,.01,Math.cos(a)*.65,.11,Math.sin(a)*.45,leaf,12);}return true;
    }
    if(F==='waterwall'){box(g,1.4,1.6,.2,0,.8,-.12,stone);box(g,1.2,1.3,.02,0,.87,0,water);box(g,1.5,.3,.5,0,.15,.08,stone);return true;}
    if(F==='compost'){posts(1,1,1.1);for(let i=0;i<7;i++)for(const z of [-.5,.5])box(g,1,.09,.05,0,.12+i*.15,z,wood);for(let i=0;i<7;i++)for(const x of [-.5,.5])box(g,.05,.09,1,x,.12+i*.15,0,wood);return true;}
    if(F==='rainbarrel'){cyl(g,.38,.32,1,0,.55,0,body);for(const y of [.2,.8])torus(g,.36,.025,0,y,0,metal,Math.PI/2);tube(g,[0,.2,.32],[0,.2,.48],.025,metal);cyl(g,.39,.39,.05,0,1.08,0,wood);return true;}
    if(F==='kitchen'){box(g,2.2,.85,.65,0,.43,0,stone);box(g,2.3,.06,.72,0,.9,0,part('top','#646c68','stone'));for(const x of [-.7,0,.7]){box(g,.62,.65,.03,x,.48,.34,wood);box(g,.16,.025,.025,x,.7,.37,metal);}cyl(g,.25,.25,.01,-.6,.94,0,metal);tube(g,[.65,.94,-.18],[.65,1.2,-.18],.018,metal);return true;}
    // Barbecue with an open shelf, lid and side trays.
    posts(.8,.5,.75);box(g,.8,.1,.5,0,.3,0,metal);box(g,.9,.32,.55,0,.85,0,metal,.06);const lid=cyl(g,.29,.29,.9,0,1.05,0,body,32);lid.rotation.z=Math.PI/2;for(const x of [-.65,.65])box(g,.35,.035,.5,x,.92,0,wood);tube(g,[-.22,1.17,.25],[.22,1.17,.25],.02,metal);return true;
  }
  if(def.model==='outdoor-accent'){
    if(F==='string'){for(const x of [-1.4,1.4])cyl(g,.035,.04,2.4,x,1.2,0,metal);arc(g,[[-1.4,2.4,0],[0,2.1,0],[1.4,2.4,0]],.007,metal);for(let i=0;i<9;i++){const x=-1.2+i*.3;ball(g,x,2.08+.18*(x*x),0,.055,.075,.055,glow);}return true;}
    if(F==='sundial'){cyl(g,.17,.25,.7,0,.35,0,stone);cyl(g,.38,.38,.06,0,.74,0,metal);tube(g,[0,.77,0],[.18,1,-.2],.02,metal);for(let i=0;i<12;i++){const a=i*Math.PI/6;box(g,.025,.01,.06,Math.cos(a)*.3,.78,Math.sin(a)*.3,wood);}return true;}
    if(F==='sculpture'){box(g,.7,.15,.5,0,.075,0,stone);const ring=torus(g,.45,.08,0,.8,0,metal);ring.scale.y=1.5;return true;}
    if(F==='birdhouse'||F==='insecthotel'){cyl(g,.04,.05,1,0,.5,0,wood);box(g,.6,.65,.35,0,1.28,0,wood);if(F==='birdhouse'){ball(g,0,1.35,.181,.09,.09,.015,metal);tube(g,[0,1.1,.18],[0,1.1,.35],.02,wood);}else for(let i=0;i<25;i++)cyl(g,.025,.025,.2,(i%5-2)*.1,1.05+Math.floor(i/5)*.1,.18,wood,8).rotation.x=Math.PI/2;for(const x of [-.17,.17]){const roof=box(g,.4,.05,.45,x,1.7,0,body);roof.rotation.z=x>0?-.5:.5;}return true;}
    const height=F==='solar'?2:F==='torch'?1.4:F==='bollard'?.7:.3;
    cyl(g,.035,.06,height,0,height/2,0,metal);if(F==='sconce')box(g,.05,.45,.1,0,.3,-.15,metal);
    box(g,.28,.08,.28,0,height+.26,0,metal);box(g,.22,.22,.22,0,height+.12,0,glow,.02);
    if(F==='lantern')for(const x of [-.14,.14])for(const z of [-.14,.14])tube(g,[x,height-.04,z],[x,height+.3,z],.012,metal);
    if(F==='solar')box(g,.32,.025,.23,0,height+.34,0,part('top','#354d58','glass'));return true;
  }
  if(def.model==='outdoor-leisure'){
    if(F==='picnic'){posts(1.5,.65,.73);plankSeat(0,.78,0,2,.75);for(const z of [-.7,.7]){plankSeat(0,.45,z,2,.3);for(const x of [-.7,.7])tube(g,[x,0,z],[x,.72,0],.045,wood);}return true;}
    if(F==='playswing'||F==='sandbox'){const small=F==='sandbox',w=small?1.6:2.4;for(const x of [-w/2,w/2])for(const z of [-.7,.7])tube(g,[x,0,z],[x,small?1.5:2.3,0],.055,wood);box(g,w+.2,.08,.08,0,small?1.5:2.3,0,wood);
      if(small){box(g,1.8,.18,1.8,0,.1,0,wood);box(g,1.65,.025,1.65,0,.2,0,part('body','#c8b48a'));box(g,1.9,.035,1.8,0,1.5,0,fabric);}else for(const x of [-.3,.3]){tube(g,[x,2.3,0],[x,.55,0],.012,metal);box(g,.6,.055,.35,0,.55,0,wood);}return true;}
    if(F==='trampoline'){cyl(g,1.2,1.2,.05,0,.7,0,metal);cyl(g,1.1,1.1,.01,0,.74,0,part('body','#444e48','cloth'));for(let i=0;i<8;i++){const a=i*Math.PI/4;tube(g,[Math.cos(a)*1.1,.05,Math.sin(a)*1.1],[Math.cos(a)*1.1,.7,Math.sin(a)*1.1],.025,metal);}return true;}
    if(F==='slide'){posts(.6,.7,1.3);box(g,.8,.06,.8,0,1.3,-.6,wood);for(let i=0;i<7;i++)box(g,.55,.035,.06,0,.15+i*.18,-1,wood);const ramp=box(g,.7,.04,1.8,0,.7,.5,body);ramp.rotation.x=.65;for(const x of [-.38,.38])tube(g,[x,1.4,-.4],[x,.1,1.3],.035,metal);return true;}
    if(F==='basketball'){box(g,.8,.1,.7,0,.05,0,metal);tube(g,[0,0,0],[0,2.7,0],.045,metal);box(g,1,.65,.04,0,2.65,0,part('body','#e0d9bd'));torus(g,.22,.018,0,2.42,.3,metal,Math.PI/2);for(let i=0;i<10;i++){const a=i*Math.PI/5;tube(g,[Math.cos(a)*.22,2.4,.3+Math.sin(a)*.22],[Math.cos(a)*.1,2.05,.3+Math.sin(a)*.1],.005,fabric);}return true;}
    if(F==='shed'){box(g,2,2,1.7,0,1,0,wood);box(g,.8,1.65,.04,0,.85,.87,body);for(const x of [-.5,.5]){const roof=box(g,1.2,.08,1.95,x,2.18,0,metal);roof.rotation.z=x>0?-.4:.4;}for(let i=0;i<10;i++)box(g,.02,1.9,1.72,-.9+i*.2,1,0,body,.002);ball(g,.25,.9,.91,.035,.035,.035,metal);return true;}
    if(F==='bikerack'){for(const z of [-.3,.3])tube(g,[-.8,.04,z],[.8,.04,z],.035,metal);for(const x of [-.5,0,.5])arc(g,[[x,0,-.3],[x,.65,-.25],[x,.65,.25],[x,0,.3]],.025,metal);return true;}
    if(F==='barrow'){const tray=box(g,.65,.25,.8,0,.5,0,body,.1);tray.rotation.x=.1;wheel(0,.22,-.45,.22);for(const x of [-.28,.28]){tube(g,[x,.1,.2],[x,.5,.2],.025,metal);tube(g,[x,.4,-.3],[x,.6,.85],.025,wood);}return true;}
    // Hose reel, coiled hose and a separate watering can.
    cyl(g,.2,.2,.3,-.2,.3,0,metal).rotation.x=Math.PI/2;for(let i=0;i<6;i++)torus(g,.18,.018,-.2,.3,-.12+i*.045,part('body','#5c7653'));cyl(g,.12,.1,.25,.25,.16,0,wood);tube(g,[.3,.2,0],[.5,.35,0],.035,metal);torus(g,.12,.015,.18,.28,0,metal);return true;
  }
  return false;
}
