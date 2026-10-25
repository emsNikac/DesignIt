import * as THREE from 'three';

export function buildCollectionModel(g, def, h) {
  const {box,cyl,ball,tube,torus,legs,material,mesh,createModel}=h;
  const color=h.color,wood=material(color,'wood'),fabric=material(color,'cloth'),body=material(color),
    brass=material('#ab9469','metal'),dark=material('#3d443c','metal'),ivory=material('#e6dec9','cloth'),
    ceramic=material('#e8e3d8','ceramic'),glass=material('#b6c5be','glass');
  const [w,height,d]=def.size;
  switch(def.model){
    case 'sectional': case 'chaise': {
      const wide=def.model==='sectional';const width=wide?3.1:.92;
      box(g,width,.25,1.05,0,.28,-.35,fabric,.09);legs(g,width-.25,.8,.15,wood);
      box(g,width,.48,.2,0,.67,-.79,fabric,.08);
      box(g,wide?1:.92,.28,1.7,wide?-1.05:0,.35,0,fabric,.1);
      for(let i=0;i<(wide?3:1);i++)box(g,wide?.91:.75,.2,.74,wide?(i-1)*.97:0,.5,-.28,fabric,.08);
      if(wide)box(g,.2,.35,1.03,1.5,.54,-.35,fabric,.07);
      box(g,.2,.35,1.65,wide?-1.5:-.37,.54,0,fabric,.07);
      box(g,.38,.36,.17,wide?-1.02:0,.72,-.58,ivory,.065);break;
    }
    case 'ottoman':cyl(g,.325,.32,.35,0,.22,0,fabric);cyl(g,.29,.29,.1,0,.05,0,wood);torus(g,.318,.008,0,.36,0,ivory,Math.PI/2);break;
    case 'ottoman-square':box(g,.7,.35,.7,0,.225,0,fabric,.09);legs(g,.5,.5,.08,wood);box(g,.66,.08,.66,0,.39,0,fabric,.05);break;
    case 'beanbag':ball(g,0,.22,.05,.46,.26,.46,fabric);ball(g,0,.43,-.2,.37,.31,.22,fabric);break;
    case 'rocker':{
      legs(g,.56,.6,.47,wood);box(g,.66,.08,.7,0,.48,0,ivory,.04);box(g,.62,.58,.08,0,.76,-.32,ivory,.04);
      for(const x of [-.33,.33]){tube(g,[x,.08,-.5],[x,.03,.05],.028,wood);tube(g,[x,.03,.05],[x,.09,.5],.028,wood);tube(g,[x,.46,.21],[x,.65,.21],.025,wood);tube(g,[x,.65,-.3],[x,.65,.3],.025,wood);}break;
    }
    case 'bar-chair':case 'cane-chair':{
      const tall=def.model==='bar-chair',seat=tall?.74:.46;legs(g,.36,.36,seat,wood);box(g,.46,.065,.44,0,seat,0,ivory,.025);
      for(const x of [-.21,.21])tube(g,[x,seat-.08,-.18],[x,seat+.31,-.2],.022,wood);
      box(g,.43,.23,.04,0,seat+.21,-.2,wood,.03);
      for(let i=0;i<12;i++)tube(g,[-.18+i*.033,seat+.1,-.174],[-.18+i*.033,seat+.31,-.174],.006,ivory);
      if(tall)torus(g,.2,.012,0,.3,0,brass,Math.PI/2);break;
    }
    case 'padded-bench':legs(g,w-.18,d-.12,.38,wood);box(g,w,.12,d,0,.43,0,fabric,.055);break;
    case 'rect-table':case 'trestle':{
      box(g,w,.065,d,0,height-.033,0,wood,.02);
      if(def.model==='trestle')for(const x of [-w*.35,w*.35]){tube(g,[x,0,-d*.42],[x,height-.06,0],.035,wood);tube(g,[x,0,d*.42],[x,height-.06,0],.035,wood);tube(g,[x,height*.4,-d*.25],[x,height*.4,d*.25],.02,wood);}
      else legs(g,w-.2,d-.17,height-.065,wood);break;
    }
    case 'glass-table':box(g,w,.035,d,0,height-.02,0,glass,.025);for(const x of [-w*.36,w*.36])for(const z of [-d*.35,d*.35])tube(g,[x,0,z],[x,height-.04,z],.016,brass);break;
    case 'block-table':box(g,w,height,d,0,height/2,0,material(color,'marble'),.045);break;
    case 'nesting':for(let i=0;i<2;i++){const x=i? .32:-.23,y=i?.34:.47,r=i?.27:.34;cyl(g,r,r,.04,x,y,0,wood);for(let j=0;j<3;j++){const a=j/3*Math.PI*2;tube(g,[x+Math.sin(a)*r*.65,0,Math.cos(a)*r*.65],[x+Math.sin(a)*r*.65,y,Math.cos(a)*r*.65],.022,wood);}}break;
    case 'c-table':box(g,w,.04,d,0,.58,0,wood);box(g,w,.025,d,0,.013,0,dark);box(g,.025,.55,d,-w*.46,.3,0,dark,.006);break;
    case 'bistro':cyl(g,w/2,w/2,.045,0,height-.022,0,material(color,'marble'));cyl(g,.025,.025,height-.05,0,height/2,0,brass);cyl(g,.26,.26,.035,0,.02,0,brass);break;
    case 'ladder-shelf':case 'open-shelf':case 'cube-shelf':case 'shoe-rack':{
      const levels=def.model==='shoe-rack'?2:def.model==='cube-shelf'?3:def.model==='ladder-shelf'?5:Math.max(2,Math.round(height/.4));
      for(const x of [-w/2+.025,w/2-.025])box(g,.05,height,d,x,height/2,0,wood,.008);
      for(let i=0;i<=levels;i++)box(g,w,.035,d,0,.025+i*(height-.05)/levels,0,wood,.006);
      if(def.model==='cube-shelf')for(const x of [-w/6,w/6])box(g,.035,height,d,x,height/2,0,wood,.005);
      if(def.model==='ladder-shelf'){for(const x of [-w/2,w/2])tube(g,[x,0,d/2],[x,height,-d/2],.022,wood);}break;
    }
    case 'wall-shelf':box(g,w,height,d,0,height/2,0,wood,.01);for(const x of [-w*.3,w*.3])tube(g,[x,-.18,-d*.4],[x,0,d*.3],.012,brass);break;
    case 'glass-cabinet':{
      box(g,w,height,.035,0,height/2,-d/2,wood,.007);
      for(const x of [-w/2,w/2])box(g,.045,height,d,x,height/2,0,wood,.008);
      for(let i=0;i<4;i++)box(g,w,.035,d,0,.03+i*(height-.06)/3,0,wood,.008);
      box(g,w-.05,height-.06,.015,0,height/2,d/2,glass,.003);
      for(const x of [-.025,.025])box(g,.012,.15,.025,x,height*.5,d/2+.018,brass,.004);break;
    }
    case 'media-unit':{
      legs(g,w-.16,d-.1,.1,dark);box(g,w,height-.1,d,0,(height+.1)/2,0,wood,.015);
      box(g,w*.3,height-.16,.025,0,(height+.1)/2,d/2+.01,dark,.008);
      for(const x of [-w*.34,w*.34])for(let i=0;i<15;i++)box(g,.009,height-.16,.015,x-w*.14+i*w*.02,(height+.1)/2,d/2+.015,wood,.003);break;
    }
    case 'trunk':box(g,w,height-.05,d,0,(height-.05)/2,0,wood,.04);box(g,w+.01,.06,d+.01,0,height-.03,0,wood,.02);for(const x of [-w*.35,w*.35])box(g,.04,.08,.02,x,height*.7,d/2,brass,.005);for(let i=0;i<26;i++)box(g,.007,height-.1,.008,-w/2+.025+i*(w-.05)/25,height*.48,d/2+.005,ivory,.002);break;
    case 'globe-pendant':tube(g,[0,.25,0],[0,.6,0],.006,dark);ball(g,0,.21,0,.21,.21,.21,material(color,'glow'));break;
    case 'dome-pendant':tube(g,[0,.2,0],[0,.55,0],.005,dark);mesh(g,new THREE.SphereGeometry(.3,40,20,0,Math.PI*2,0,Math.PI/2),body,0,.17,0);cyl(g,.29,.29,.015,0,.17,0,material('#f0dab1','glow'));break;
    case 'chandelier':{
      tube(g,[0,.25,0],[0,.8,0],.008,brass);
      for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*.43,z=Math.sin(a)*.43;tube(g,[0,.25,0],[x,.25,z],.012,brass);ball(g,x,.25,z,.12,.12,.12,material('#f0e6ce','glow'));}break;
    }
    case 'tripod-lamp':for(let i=0;i<3;i++){const a=i/3*Math.PI*2;tube(g,[Math.sin(a)*.28,0,Math.cos(a)*.28],[0,1.3,0],.018,wood);}cyl(g,.21,.31,.4,0,1.4,0,material(color,'glow'));break;
    case 'pleated-lamp':cyl(g,.09,.12,.2,0,.1,0,body);tube(g,[0,.1,0],[0,.4,0],.014,brass);cyl(g,.1,.2,.25,0,.425,0,material(color,'glow'));for(let i=0;i<40;i++){const a=i/40*Math.PI*2;tube(g,[Math.sin(a)*.1,.55,Math.cos(a)*.1],[Math.sin(a)*.2,.3,Math.cos(a)*.2],.003,ivory);}break;
    case 'lantern':cyl(g,.17,.14,.4,0,.22,0,material('#e1cba4','glow'));for(let i=0;i<24;i++){const a=i/24*Math.PI*2;tube(g,[Math.sin(a)*.14,.03,Math.cos(a)*.14],[Math.sin(a)*.17,.42,Math.cos(a)*.17],.005,wood);}torus(g,.08,.01,0,.47,0,wood);break;
    case 'sconce':cyl(g,.1,.1,.03,0,.2,-.07,brass).rotation.x=Math.PI/2;tube(g,[0,.2,-.07],[0,.2,.05],.012,brass);ball(g,0,.2,.05,.12,.15,.12,material(color,'glow'));break;
    case 'television':box(g,1.15,.65,.035,0,.43,0,dark,.015);box(g,1.1,.6,.008,0,.43,.022,material('#52665f','ceramic'),.008);for(const x of [-.36,.36])tube(g,[x-.06,0,.09],[x,.13,0],.014,dark);break;
    case 'laptop':box(g,.33,.015,.25,0,.01,.04,body,.009);box(g,.33,.22,.012,0,.12,-.08,body,.007);box(g,.3,.19,.006,0,.125,-.071,material('#64796f','ceramic'),.005);for(let i=0;i<4;i++)for(let j=0;j<9;j++)box(g,.023,.003,.018,-.12+j*.03,.02,-.035+i*.025,dark,.002);break;
    case 'clock':{
      const face=cyl(g,.2,.2,.035,0,.2,0,wood);face.rotation.x=Math.PI/2;
      const dial=cyl(g,.18,.18,.009,0,.2,.02,ceramic);dial.rotation.x=Math.PI/2;
      tube(g,[0,.2,.027],[.09,.26,.027],.006,dark);tube(g,[0,.2,.028],[-.01,.32,.028],.005,dark);break;
    }
    case 'sculpture':box(g,.18,.04,.14,0,.02,0,material(color,'marble'));torus(g,.1,.035,0,.16,0,material(color,'marble'));torus(g,.075,.03,0,.33,0,material(color,'marble'));break;
    case 'tray':{const p=cyl(g,.2,.2,.025,0,.015,0,wood);p.scale.z=.65;const edge=torus(g,.19,.012,0,.035,0,wood,Math.PI/2);edge.scale.y=.65;break;}
    case 'cushion':box(g,.45,.15,.45,0,.075,0,fabric,.08);for(const x of [-.2,.2])box(g,.008,.04,.38,x,.07,0,ivory,.003);break;
    case 'basket':cyl(g,.2,.16,.35,0,.18,0,wood);for(let i=0;i<20;i++)torus(g,.162+i*.0018,.005,0,.03+i*.016,0,ivory,Math.PI/2);for(const x of [-.19,.19])torus(g,.055,.01,x,.35,0,wood);break;
    case 'coatstand':cyl(g,.21,.21,.04,0,.02,0,wood);tube(g,[0,.04,0],[0,1.75,0],.025,wood);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;tube(g,[0,1.2+i*.07,0],[Math.sin(a)*.24,1.4+i*.06,Math.cos(a)*.24],.018,wood);}break;
    case 'cactus':cyl(g,.19,.14,.25,0,.125,0,material('#b68765'));cyl(g,.07,.08,.4,0,.42,0,body);ball(g,0,.62,0,.07,.07,.07,body);for(const x of [-.13,.13]){tube(g,[0,.39,0],[x,.39,0],.044,body);tube(g,[x,.39,0],[x,.52,0],.044,body);ball(g,x,.52,0,.044,.044,.044,body);}break;
    case 'flowers':{
      g.add(createModel({model:'vase',size:[.22,.34,.22],color:'#c6b492'}));
      for(let i=0;i<9;i++){const a=i*2.4,x=Math.sin(a)*.14,z=Math.cos(a)*.14,y=.48+i*.017;tube(g,[0,.2,0],[x,y,z],.003,material('#758065'));for(let j=0;j<5;j++)ball(g,x+Math.sin(j*1.26)*.025,y,z+Math.cos(j*1.26)*.025,.025,.014,.025,body);}break;
    }
    case 'frame':box(g,.2,.28,.025,0,.14,0,wood,.008);box(g,.17,.25,.008,0,.14,.018,ceramic,.003);ball(g,0,.18,.024,.05,.06,.003,body);tube(g,[0,0,-.06],[0,.23,0],.009,wood);break;
    case 'record-player':box(g,.4,.12,.32,0,.06,0,wood,.015);cyl(g,.13,.13,.013,-.04,.127,0,dark);cyl(g,.035,.035,.016,-.04,.137,0,ceramic);tube(g,[.14,.16,-.1],[.08,.16,.09],.006,brass);break;
    case 'curtains':tube(g,[-.95,2.3,0],[.95,2.3,0],.012,brass);for(const side of [-1,1])for(let i=0;i<14;i++)box(g,.025,2.22,.07,side*(.45+i*.035),1.11,Math.sin(i*1.5)*.025,ivory,.008);break;
    case 'round-mirror':{const frame=cyl(g,.35,.35,.03,0,.35,0,brass);frame.rotation.x=Math.PI/2;const mirror=cyl(g,.33,.33,.01,0,.35,.022,material('#bdc9c4','metal'));mirror.rotation.x=Math.PI/2;break;}
    case 'dishwasher':case 'washer':{
      box(g,w,height,d,0,height/2,0,material(color,'ceramic'),.025);box(g,w-.04,.13,.015,0,height-.085,d/2+.01,dark,.006);
      for(const x of [-.2,.2]){const knob=cyl(g,.025,.025,.018,x,height-.085,d/2+.025,brass);knob.rotation.x=Math.PI/2;}
      if(def.model==='washer'){torus(g,.2,.025,0,.4,d/2+.025,brass);const door=cyl(g,.175,.175,.015,0,.4,d/2+.03,material('#53625d','glass'));door.rotation.x=Math.PI/2;}
      else box(g,.35,.025,.035,0,height-.21,d/2+.025,brass,.008);break;
    }
    case 'microwave':box(g,.48,.29,.35,0,.145,0,body,.018);box(g,.35,.21,.015,-.04,.14,.18,dark,.008);box(g,.055,.02,.012,.19,.2,.19,brass,.005);box(g,.055,.02,.012,.19,.12,.19,brass,.005);break;
    case 'espresso':box(g,.3,.3,.25,0,.21,0,body,.03);box(g,.3,.04,.3,0,.02,.025,dark,.015);box(g,.22,.12,.12,0,.15,.12,dark,.01);tube(g,[0,.24,.08],[0,.24,.18],.015,brass);cyl(g,.035,.03,.065,0,.074,.1,ceramic);break;
    case 'toaster':box(g,.26,.18,.18,0,.09,0,body,.04);for(const z of [-.04,.04])box(g,.19,.006,.025,0,.183,z,dark,.01);tube(g,[.135,.06,0],[.135,.13,0],.01,brass);break;
    case 'mixer':box(g,.28,.035,.25,0,.018,0,body,.02);box(g,.07,.32,.17,-.1,.18,-.03,body,.025);box(g,.3,.07,.15,0,.34,0,body,.035);ball(g,.05,.11,0,.1,.08,.1,brass);tube(g,[.05,.2,0],[.05,.31,0],.008,dark);break;
    case 'mugs':for(const x of [-.09,.09]){cyl(g,.05,.042,.1,x,.05,0,material(color,'ceramic'));torus(g,.035,.009,x+.055,.055,0,material(color,'ceramic'));cyl(g,.041,.041,.005,x,.1,0,material('#797465'));}break;
    case 'plates':for(let i=0;i<4;i++){cyl(g,.14,.12,.013,0,.008+i*.014,0,ceramic);torus(g,.132,.005,0,.016+i*.014,0,ceramic,Math.PI/2);}break;
    case 'cutting-board':box(g,.36,.025,.25,-.02,.013,0,wood,.04);box(g,.09,.025,.08,.19,.013,0,wood,.015);break;
    case 'trash-bin':cyl(g,.15,.135,.5,0,.25,0,body);cyl(g,.16,.16,.035,0,.52,0,dark);box(g,.1,.015,.08,0,.025,.145,brass,.008);break;
    case 'canopy-bed':case 'platform-bed':{
      const bed=createModel({model:'bed',size:[1.8,1.05,2.1],color:def.model==='platform-bed'?'#d4c8ae':color});g.add(bed);
      if(def.model==='platform-bed'){bed.scale.y=.6;box(g,1.9,.15,2.15,0,.12,0,wood,.02);}
      else{for(const x of [-.92,.92])for(const z of [-1.02,1.02])tube(g,[x,0,z],[x,2.3,z],.025,wood);for(const x of [-.92,.92])tube(g,[x,2.3,-1.02],[x,2.3,1.02],.025,wood);for(const z of [-1.02,1.02])tube(g,[-.92,2.3,z],[.92,2.3,z],.025,wood);}break;
    }
    case 'dressing-table':box(g,1.1,.055,.45,0,.73,0,wood,.018);legs(g,.95,.33,.7,wood);const mirror=cyl(g,.28,.28,.035,0,1.08,-.17,brass);mirror.rotation.x=Math.PI/2;const face=cyl(g,.26,.26,.015,0,1.08,-.146,material('#bac7c0','metal'));face.rotation.x=Math.PI/2;break;
    case 'blanket':for(let i=0;i<4;i++)box(g,.65,.03,.45,0,.015+i*.03,0,fabric,.015);for(let i=0;i<35;i++)tube(g,[-.31+i*.018,.08,.22],[-.31+i*.018,.06,.26],.003,ivory);break;
    case 'double-vanity':{
      box(g,1.5,.55,.5,0,.5,0,wood,.02);box(g,1.55,.045,.53,0,.8,0,ceramic,.015);
      for(const x of [-.38,.38]){ball(g,x,.85,0,.27,.065,.18,ceramic);tube(g,[x,.82,-.2],[x,1.04,-.2],.012,brass);tube(g,[x,1.04,-.2],[x,1.04,-.07],.012,brass);box(g,.025,.12,.02,x,.51,.26,brass,.006);}break;
    }
    case 'pedestal-sink':cyl(g,.12,.17,.7,0,.35,0,ceramic);ball(g,0,.8,0,.25,.07,.22,ceramic);tube(g,[0,.8,-.15],[0,.99,-.15],.012,brass);tube(g,[0,.99,-.15],[0,.99,0],.012,brass);break;
    case 'towels':for(let i=0;i<3;i++){const roll=cyl(g,.07,.07,.28,(i-1)*.11,.07+(i===1?.09:0),0,ivory);roll.rotation.x=Math.PI/2;torus(g,.045,.012,(i-1)*.11,.07+(i===1?.09:0),.145,fabric);}break;
    case 'soap':cyl(g,.045,.04,.14,0,.07,0,body);tube(g,[0,.14,0],[0,.18,0],.008,brass);tube(g,[0,.18,0],[.035,.18,0],.008,brass);break;
    case 'paper-holder':tube(g,[-.09,.08,-.04],[.09,.08,-.04],.01,brass);const roll=cyl(g,.065,.065,.13,0,.08,0,ceramic);roll.rotation.z=Math.PI/2;break;
    case 'medicine-cabinet':box(g,.65,.75,.18,0,.375,0,wood,.012);box(g,.6,.7,.015,0,.375,.1,material('#b9c6c0','metal'),.008);break;
    case 'radiator':for(const x of [-.23,.23])tube(g,[x,0,0],[x,1.2,0],.018,brass);for(let i=0;i<10;i++)tube(g,[-.23,.06+i*.12,0],[.23,.06+i*.12,0],.012,brass);break;
    default:return false;
  }
  return true;
}
