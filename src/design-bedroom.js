export function buildDesignerBedroom(g,def,h){
  if(def.model!=='design-bedroom')return false;
  const {box,cyl,ball,tube,torus,arc,panel,part}=h,F=def.design.form,[w,H,d]=def.size;
  const wood=part('frame',h.color,'wood'),fabric=part('body',h.color,'cloth'),linen=part('accent','#dfd5be','cloth'),metal=part('hardware','#ac9872','metal'),dark=part('details','#56614e','matte'),mirror=part('glass','#b8c8bf','mirror');
  const legs=(width,depth,height)=>{for(const x of [-width/2,width/2])for(const z of [-depth/2,depth/2])tube(g,[x,0,z],[x,height,z],.023,wood);};
  const mattress=(width,depth,y)=>{box(g,width,.18,depth,0,y,0,linen,.06);box(g,width-.04,.055,depth*.65,0,y+.115,depth*.16,fabric,.03);for(const x of [-width*.24,width*.24])box(g,width*.4,.09,.34,x,y+.13,-depth*.32,linen,.05);};
  if(F==='bed'){
    const head=def.design.head,headH=['canopy','poster'].includes(head)?1.05:H,back=-d*.46;
    box(g,w,.18,d,0,.24,0,wood,.025);if(head!=='floating')legs(w*.85,d*.85,.16);else box(g,w*.6,.15,d*.6,0,.1,0,dark,.02);mattress(w-.08,d-.08,.43);
    if(['spindle','rattan','lattice'].includes(head)){
      for(const x of [-w/2,w/2])tube(g,[x,.2,back],[x,headH,back],.025,wood);
      for(const y of [.55,headH])box(g,w,.05,.06,0,y,back,wood,.015);
      for(let i=0;i<14;i++){const x=-w*.46+i*w*.92/13;tube(g,[x,.56,back],[head==='lattice'?-x:x,headH-.025,back],head==='spindle'?.01:.006,wood);if(head==='rattan')tube(g,[-w/2,.56+i*(headH-.6)/13,back+.01],[w/2,.56+i*(headH-.6)/13,back+.01],.006,linen);}
    }else if(head==='scallop'){
      for(let i=0;i<7;i++){const x=(i-3)*w/7;box(g,w/7,.56,.12,x,.76,back,fabric,.06);ball(g,x,1.04,back,w/14,.09,.06,fabric);}
    }else if(head==='channel')for(let i=0;i<10;i++)box(g,w/10-.008,.73,.13,(i-4.5)*w/10,.8,back,fabric,.065);
    else if(head==='stepped'){for(let i=0;i<3;i++)box(g,w-i*.22,.6+i*.13,.08,0,.65+i*.065,back-.015*i,wood,.008);}
    else{
      box(g,w,headH-.35,.12,0,(headH+.35)/2,back,fabric,head==='arched'?.12:.04);
      if(head==='arched')arc(g,[[-w/2,headH-.18,back],[0,headH+.13,back],[w/2,headH-.18,back]],.035,wood);
      if(head==='winged')for(const x of [-w*.5,w*.5])box(g,.13,.8,.3,x,.78,back+.1,fabric,.04);
      if(head==='tufted')for(let row=0;row<3;row++)for(let col=0;col<7;col++)ball(g,(col-3)*w*.13,.62+row*.17,back+.068,.013,.013,.005,metal);
    }
    if(['canopy','poster'].includes(head))for(const x of [-w/2,w/2])for(const z of [-d/2,d/2]){tube(g,[x,0,z],[x,H,z],.028,wood);ball(g,x,H,z,.045,.045,.045,wood);if(head==='canopy'){for(let i=0;i<6;i++)box(g,.018,1.8,.06,x+(i-2.5)*.023,1.12,z,linen,.005);tube(g,[x,H,-d/2],[x,H,d/2],.025,wood);tube(g,[-w/2,H,z],[w/2,H,z],.025,wood);}}
    return true;
  }
  if(F.startsWith('wardrobe')||F==='dresser-arch'){
    const height=F==='dresser-arch'?H*.7:H;box(g,w,height,.025,0,height/2,-d/2,wood);for(const x of [-w/2,w/2])box(g,.04,height,d,x,height/2,0,wood,.006);for(const y of [.04,height])box(g,w,.04,d,0,y,0,wood);
    if(F==='wardrobe-open'){tube(g,[-w*.44,height*.8,0],[w*.44,height*.8,0],.012,metal);for(let i=0;i<7;i++){const x=(i-3)*w*.1;tube(g,[x,height*.8,0],[x,height*.7,0],.004,metal);box(g,w*.085,height*.4,d*.55,x,height*.5,0,i%2?linen:fabric,.02);}box(g,w,.03,d,0,height*.2,0,wood);}
    else for(let i=0;i<3;i++){const x=(i-1)*w/3;box(g,w/3-.015,height-.08,.035,x,height/2,d/2,wood,F==='wardrobe-curved'?.08:.008);if(F==='wardrobe-shoji')for(let j=0;j<10;j++)box(g,w/3-.04,.01,.008,x,.06+j*(height-.12)/9,d/2+.024,linen);if(F==='wardrobe-louver')for(let j=0;j<25;j++){const slat=box(g,w/3-.04,.025,.025,x,.07+j*(height-.14)/24,d/2+.025,wood);slat.rotation.x=.3;}tube(g,[x+w*.09,height*.4,d/2+.045],[x+w*.09,height*.55,d/2+.045],.008,metal);}
    if(F==='dresser-arch'){for(let i=0;i<4;i++){box(g,w-.035,.14,.02,0,.12+i*.18,d/2+.025,fabric,.008);tube(g,[-.1,.12+i*.18,d/2+.05],[.1,.12+i*.18,d/2+.05],.007,metal);}const oval=cyl(g,.32,.32,.025,0,height+.34,-d*.3,mirror);oval.rotation.x=Math.PI/2;oval.scale.y=1.15;}
    return true;
  }
  if(F.startsWith('night')){
    if(F==='night-drum'){cyl(g,w/2,w/2,H,0,H/2,0,wood);for(let i=0;i<24;i++){const a=i*Math.PI/12;tube(g,[Math.sin(a)*w/2,.05,Math.cos(a)*d/2],[Math.sin(a)*w/2,H-.04,Math.cos(a)*d/2],.006,metal);}}
    else if(F==='night-pedestal'){cyl(g,w*.3,w*.4,.035,0,.02,0,wood);cyl(g,.05,.07,H-.05,0,H/2,0,wood);panel(g,'oval',w,d,.04,H,wood);}
    else if(F==='night-step'){box(g,w,H*.55,d,0,H*.275,0,wood,.01);box(g,w*.6,H*.45,d,-w*.2,H*.775,0,wood,.01);}
    else if(F==='night-tripod'){panel(g,'round',w,d,.04,H,wood);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;tube(g,[Math.sin(a)*w*.4,0,Math.cos(a)*d*.4],[0,H-.04,0],.02,wood);}}
    else{for(const x of [-w/2,w/2])box(g,.025,H,d,x,H/2,0,wood,.005);for(const y of [.02,H])box(g,w,.025,d,0,y,0,wood,.005);if(F==='night-floating'){box(g,w-.04,H*.7,.025,0,H*.5,d/2,fabric,.01);tube(g,[-.08,H*.5,d/2+.025],[.08,H*.5,d/2+.025],.008,metal);}}
    return true;
  }
  switch(F){
    case 'vanity-standing':case 'vanity-wall':box(g,w,.08,d,0,.73,0,wood,.02);if(F==='vanity-standing')legs(w*.8,d*.75,.7);box(g,w*.8,.13,d*.8,0,.63,0,wood);const face=cyl(g,.3,.3,.025,0,1.12,-d*.35,mirror);face.rotation.x=Math.PI/2;face.scale.y=1.4;break;
    case 'quilt-ladder':for(const x of [-.3,.3])tube(g,[x,0,.12],[x,1.5,-.1],.025,wood);for(let i=0;i<5;i++){const y=.25+i*.27;tube(g,[-.3,y,.12-y*.14],[.3,y,.12-y*.14],.018,wood);}for(const [x,y] of [[-.1,.75],[.12,1.15]])box(g,.35,.5,.04,x,y,.03,linen,.025);break;
    case 'dressing-screen':for(let i=0;i<3;i++){const x=(i-1)*.46,z=i===1?0:.12;box(g,.43,1.65,.025,x,.9,z,wood,.02);box(g,.37,1.5,.008,x,.9,z+.018,linen,.025);for(const xx of [-.2,.2])tube(g,[x+xx,0,z],[x+xx,1.73,z],.015,wood);}break;
    case 'valet':cyl(g,.2,.2,.03,0,.02,0,wood);tube(g,[0,.02,0],[0,1.2,0],.025,wood);arc(g,[[-.25,1.03,0],[0,1.2,0],[.25,1.03,0]],.025,wood);tube(g,[-.25,.75,.12],[.25,.75,.12],.015,metal);break;
    case 'jewelry':for(const x of [-.2,.2])tube(g,[x,0,.1],[x,1.1,0],.02,wood);box(g,.4,1,.12,0,.8,0,wood,.02);box(g,.34,.92,.015,0,.8,.07,mirror,.015);for(let i=0;i<5;i++)torus(g,.025,.004,.23,.4+i*.15,.025,metal);break;
    case 'bedsteps':for(let i=0;i<3;i++){const height=(i+1)*.16,z=(i-1)*.17;box(g,.55,height,.18,0,height/2,z,wood,.01);box(g,.18,.035,.008,0,height*.5,z+.095,metal,.004);}break;
    case 'daybed':case 'trundle':legs(.85,1.8,.2);box(g,1,.12,2,0,.25,0,wood);mattress(.94,1.9,.4);box(g,.08,.65,2,-.5,.6,0,fabric,.04);for(const z of [-.88,.88]){const roll=cyl(g,.12,.12,.8,0,.65,z,linen);roll.rotation.z=Math.PI/2;}if(F==='trundle'){box(g,.88,.12,1.8,.5,.15,0,wood);box(g,.85,.09,1.75,.5,.24,0,linen);}break;
    case 'moses':panel(g,'oval',.9,.5,.08,.5,wood);const rim=torus(g,.25,.02,0,.68,0,wood,Math.PI/2);rim.scale.x=1.8;for(let i=0;i<28;i++){const a=i*Math.PI/14;tube(g,[Math.sin(a)*.4,.5,Math.cos(a)*.21],[Math.sin(a)*.45,.68,Math.cos(a)*.25],.009,wood);}legs(.65,.35,.5);box(g,.7,.04,.32,0,.55,0,linen,.08);break;
    case 'toddler':box(g,.95,.15,1.8,0,.13,0,wood);mattress(.88,1.7,.27);for(const z of [-.9,.9]){for(const x of [-.48,.48])tube(g,[x,0,z],[x,.8,z],.025,wood);tube(g,[-.48,.8,z],[0,1.2,z],.025,wood);tube(g,[.48,.8,z],[0,1.2,z],.025,wood);}tube(g,[0,1.2,-.9],[0,1.2,.9],.02,wood);break;
    case 'changing':box(g,.9,.85,.5,0,.425,0,wood,.02);for(let i=0;i<3;i++){box(g,.86,.22,.025,0,.17+i*.24,.26,fabric,.008);tube(g,[-.1,.17+i*.24,.28],[.1,.17+i*.24,.28],.008,metal);}box(g,.85,.08,.46,0,.9,0,linen,.04);for(const x of [-.43,.43])box(g,.025,.14,.5,x,.92,0,wood);break;
    case 'baby-rocker':for(const x of [-.4,.4])arc(g,[[x,.12,-.38],[x,.025,0],[x,.12,.38]],.025,wood);for(const x of [-.3,.3])tube(g,[x,.05,0],[x,.5,0],.02,wood);panel(g,'oval',.85,.45,.12,.5,wood);for(let i=0;i<24;i++){const a=i*Math.PI/12;tube(g,[Math.sin(a)*.38,.43,Math.cos(a)*.18],[Math.sin(a)*.42,.65,Math.cos(a)*.22],.008,wood);}break;
    case 'hat-rack':tube(g,[0,.02,0],[0,1.6,0],.025,wood);cyl(g,.2,.2,.035,0,.02,0,wood);for(let i=0;i<5;i++){const a=i*2.4,x=Math.sin(a)*.25,z=Math.cos(a)*.25,y=.7+i*.18;tube(g,[0,y,0],[x,y+.05,z],.014,wood);cyl(g,.11,.14,.02,x,y+.07,z,linen);cyl(g,.075,.08,.06,x,y+.1,z,linen);}break;
    case 'dressing-rack':for(const x of [-.4,.4]){tube(g,[x,0,-.2],[x,0,.2],.018,metal);tube(g,[x,.02,0],[x,1.55,0],.02,metal);}tube(g,[-.4,1.55,0],[.4,1.55,0],.02,metal);for(let i=0;i<7;i++){const x=(i-3)*.1;arc(g,[[x,1.55,0],[x,1.46,-.15],[x,1.46,.15],[x,1.55,0]],.004,wood);box(g,.04,.65,.32,x,1.05,0,i%2?linen:fabric,.02);}break;
    case 'shoe-tower':tube(g,[0,0,0],[0,1.3,0],.025,metal);for(let i=0;i<6;i++){cyl(g,.3,.3,.025,0,.04+i*.23,0,wood);for(const x of [-.12,.12])ball(g,x,.1+i*.23,0,.065,.045,.13,fabric);}break;
    case 'bed-tray':box(g,.65,.035,.4,0,.23,0,wood,.02);for(const x of [-.27,.27])arc(g,[[x,0,-.15],[x,.21,-.15],[x,.21,.15],[x,0,.15]],.012,wood);for(const z of [-.2,.2])box(g,.65,.04,.018,0,.25,z,wood);break;
    default:throw new Error(`Unknown bedroom design ${F}`);
  }
  return true;
}
