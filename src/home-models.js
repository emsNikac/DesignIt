import {wallSections} from './architecture.js';

export function buildHomeModel(g,def,h){
  const {box,cyl,ball,tube,torus,legs,part}=h,[w,H,d]=def.size;
  const body=part('body',h.color,'matte'),wood=part('frame',h.color,'wood'),frame=part('frame','#596054','metal'),
    metal=part('hardware','#a9afa3','brushed'),fabric=part('accent','#c9c0a8','cloth'),dark=part('details','#343d34','matte'),
    white=part('ceramic','#e5e1d4','ceramic'),glass=part('glass','#b2c5b9','glass');
  if(def.architecture){
    if(def.model==='glass-wall'){
      const border=part('frame',h.color,'metal');
      box(g,w-.06,H-.06,.012,0,H/2,0,glass,.003);
      for(const x of [-w/2+.015,w/2-.015,0])box(g,.03,H,d,x,H/2,0,border,.003);
      for(const y of [.015,H-.015])box(g,w,.03,d,0,y,0,border,.003);
    }else if(def.model==='slat-wall'){
      for(const y of [.025,H-.025])box(g,w,.05,d,0,y,0,wood,.003);
      const count=Math.max(3,Math.round(w/.09));
      for(let i=0;i<count;i++)box(g,.04,H-.1,d,-w/2+.025+i*(w-.05)/(count-1),H/2,0,wood,.003);
    }else{
      for(const b of wallSections(def))box(g,b.width,b.height,b.depth,b.x,b.y,b.z,b.part==='glass'?glass:body,.003);
      const opening=def.model==='doorway-wall'?Math.min(.95,w*.55):0;
      const trim=part('accent','#eee9df','matte');
      for(const sign of [-1,1]){
        if(opening){const side=(w-opening)/2;for(const x of [-(w+opening)/4,(w+opening)/4])box(g,side,.09,.012,x,.045,sign*(d/2-.006),trim,.002);}
        else box(g,w,.09,.012,0,.045,sign*(d/2-.006),trim,.002);
      }
      if(def.model==='window-wall'){
        const width=w*.55,bottom=H*.35,top=H*.8;
        for(const x of [-width/2,width/2,0])box(g,.028,top-bottom,.035,x,(top+bottom)/2,0,wood,.002);
        for(const y of [bottom,top])box(g,width,.028,.035,0,y,0,wood,.002);
      }
    }
    return true;
  }
  switch(def.model){
    case 'recliner':{
      legs(g,.62,.65,.16,frame);box(g,.8,.24,.8,0,.32,0,part('body',h.color,'leather'),.09);
      const back=box(g,.72,.66,.2,0,.7,-.3,part('body',h.color,'leather'),.08);back.rotation.x=-.2;
      for(const x of [-.42,.42])box(g,.16,.24,.8,x,.53,0,body,.06);
      const rest=box(g,.65,.12,.45,0,.31,.58,fabric,.04);rest.rotation.x=-.15;break;
    }
    case 'high-chair':for(const x of [-.2,.2])for(const z of [-.2,.2])tube(g,[x*1.3,0,z*1.3],[x,.68,z],.025,wood);box(g,.36,.07,.35,0,.62,0,fabric,.04);box(g,.36,.27,.05,0,.8,-.15,wood,.03);box(g,.48,.03,.3,0,.77,.18,part('top','#d7c9ad','wood'),.05);box(g,.4,.025,.13,0,.33,.16,wood);break;
    case 'drafting-table':for(const x of [-.5,.5]){tube(g,[x,0,-.3],[x,.85,0],.035,wood);tube(g,[x,0,.3],[x,.85,0],.035,wood);}const top=box(g,w,.06,d,0,.88,0,part('top',h.color,'wood'),.015);top.rotation.x=.24;box(g,w,.025,.025,0,.79,.38,metal);box(g,.7,.006,.48,0,.93,0,white,.002).rotation.x=.24;break;
    case 'folding-table':box(g,w,.045,d,0,H-.025,0,part('top',h.color,'wood'),.015);for(const z of [-d*.35,d*.35]){tube(g,[-w*.4,0,z],[w*.3,H-.04,z],.02,frame);tube(g,[w*.4,0,z],[-w*.3,H-.04,z],.02,frame);}break;
    case 'filing-cabinet':box(g,w,H,d,0,H/2,0,body,.018);for(let i=0;i<3;i++){const y=.12+i*.19;box(g,w-.035,.17,.015,0,y,d/2,body,.006);box(g,.15,.018,.025,0,y+.025,d/2+.015,metal,.004);box(g,.09,.035,.004,0,y-.025,d/2+.012,white,.002);}for(const x of [-.15,.15])for(const z of [-.18,.18])ball(g,x,.015,z,.025,.025,.025,dark);break;
    case 'peg-rail':box(g,w,.16,.035,0,.15,0,wood,.008);box(g,w,.025,.18,0,.24,.06,part('top',h.color,'wood'),.006);for(let i=0;i<5;i++){const x=(i-2)*.17;tube(g,[x,.13,.025],[x,.12,.09],.012,metal);ball(g,x,.13,.09,.017,.017,.017,metal);}break;
    case 'ceiling-fan':tube(g,[0,.18,0],[0,.38,0],.025,metal);ball(g,0,.15,0,.11,.065,.11,body);cyl(g,.09,.09,.03,0,.08,0,part('shade','#e9dec0','glow'));for(let i=0;i<3;i++){const a=i*Math.PI*2/3;box(g,.55,.025,.13,Math.cos(a)*.3,.16,Math.sin(a)*.3,wood,.035,-a);}cyl(g,.1,.1,.035,0,.39,0,body);break;
    case 'light-bar':cyl(g,.11,.11,.025,0,.015,0,frame);box(g,.035,H-.03,.03,0,H/2,0,metal,.01);box(g,.012,H-.12,.006,0,H/2,.02,part('shade','#f0e2bd','glow'),.003);break;
    case 'standing-fan':cyl(g,.2,.2,.035,0,.02,0,body);tube(g,[0,.04,0],[0,.91,0],.025,metal);torus(g,.22,.012,0,1,0,frame);for(let i=0;i<24;i++){const a=i*Math.PI/12;tube(g,[0,1,.03],[Math.sin(a)*.215,1+Math.cos(a)*.215,.03],.003,metal);}for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const blade=ball(g,Math.sin(a)*.1,1+Math.cos(a)*.1,0,.06,.12,.012,body);blade.rotation.z=-a;}ball(g,0,1,.045,.035,.035,.018,body);break;
    case 'vacuum-dock':box(g,.3,.04,.28,0,.02,0,body,.03);tube(g,[0,.06,0],[0,1.08,0],.02,metal);box(g,.24,.05,.12,0,.08,.06,dark,.025);box(g,.1,.25,.1,0,.92,0,body,.03);cyl(g,.04,.04,.2,0,.73,0,glass);tube(g,[0,1.02,0],[0,1.14,-.07],.015,frame);break;
    case 'desktop-monitor':box(g,.2,.015,.16,0,.008,0,frame,.008);tube(g,[0,.01,0],[0,.21,0],.018,metal);box(g,.62,.36,.035,0,.3,0,frame,.01);box(g,.58,.32,.004,0,.3,.02,part('body','#526c62','lacquer'),.004);break;
    case 'printer':box(g,w,.16,d,0,.09,0,body,.025);box(g,w-.06,.035,d-.05,0,.185,-.015,frame,.012);box(g,.28,.012,.2,0,.03,.2,body,.006);box(g,.23,.003,.18,0,.039,.21,white,0);box(g,.07,.02,.005,-.12,.14,d/2+.003,part('details','#738b7e','lacquer'));break;
    case 'desk-organizer':box(g,.35,.025,.2,0,.015,0,wood,.012);for(const x of [-.11,0,.11]){box(g,.09,.12,.1,x,.08,-.03,body,.008);for(let i=0;i<3;i++)tube(g,[x+(i-1)*.015,.04,-.03],[x+(i-1)*.015,.2+i*.012,-.04],.004,part('accent',i%2?'#84967c':'#bd9769','matte'));}break;
    case 'umbrella-stand':cyl(g,.13,.1,.42,0,.21,0,body);for(const x of [-.05,.05]){tube(g,[x,.1,0],[x,.62,0],.008,metal);torus(g,.035,.008,x+.035,.61,0,wood,0,Math.PI);}break;
    case 'boot-tray':box(g,.65,.025,.4,0,.015,0,dark,.025);for(const x of [-.13,.13]){box(g,.17,.04,.3,x,.05,0,wood,.04);ball(g,x,.1,.035,.08,.05,.14,body);cyl(g,.06,.065,.15,x,.13,-.07,body);}break;
    case 'air-fryer':box(g,w,H,d,0,H/2,0,body,.06);box(g,w-.03,H*.55,.025,0,H*.32,d/2,frame,.04);tube(g,[-.07,H*.34,d/2+.03],[.07,H*.34,d/2+.03],.012,metal);box(g,.12,.04,.004,0,H*.78,d/2+.001,part('details','#729083','lacquer'));break;
    case 'extractor-hood':box(g,w,.12,d,0,.12,0,metal,.02);box(g,.28,.5,.26,0,.4,-.1,metal,.012);box(g,w-.08,.012,d-.08,0,.053,0,frame,.005);for(const x of [-.25,.25])cyl(g,.035,.035,.006,x,.05,.1,part('shade','#efdfb9','glow'));break;
    case 'fruit-bowl':cyl(g,.16,.1,.07,0,.04,0,white);for(let i=0;i<6;i++){const a=i*2.4;ball(g,Math.cos(a)*.075,.1+i%2*.035,Math.sin(a)*.075,.045,.045,.045,part('accent',i%2?'#b8a854':'#b68f51','matte'));}break;
    case 'dish-rack':box(g,w,.025,d,0,.015,0,wood,.012);for(let i=0;i<7;i++){const x=-.18+i*.06;const plate=cyl(g,.1,.1,.012,x,.11,0,white);plate.rotation.z=Math.PI/2;tube(g,[x-.02,.02,-.13],[x-.02,.16,-.13],.004,metal);tube(g,[x-.02,.02,.13],[x-.02,.16,.13],.004,metal);}break;
    case 'crib':box(g,w,.06,d,0,.2,0,wood,.01);box(g,w-.09,.09,d-.09,0,.28,0,fabric,.04);for(const z of [-d/2,d/2]){for(const y of [.12,.93])box(g,w,.05,.04,0,y,z,wood);for(let i=0;i<17;i++)box(g,.018,.78,.025,-w/2+.04+i*(w-.08)/16,.53,z,wood,.003);}for(const x of [-w/2,w/2]){box(g,.04,.95,d,x,.5,0,wood,.01);}break;
    case 'bunk-bed':for(const x of [-w/2+.035,w/2-.035])for(const z of [-d/2+.035,d/2-.035])box(g,.07,H,.07,x,H/2,z,wood,.01);for(const y of [.3,1.3]){box(g,w,.06,d,0,y,0,wood,.01);box(g,w-.08,.13,d-.08,0,y+.09,0,fabric,.04);box(g,w-.12,.06,d*.63,0,y+.18,.25,part('body',h.color,'cloth'),.025);box(g,.65,.09,.32,0,y+.19,-.7,white,.04);}for(const z of [-d/2+.03,d/2-.03])box(g,w,.035,.04,0,1.72,z,wood);for(const x of [-w/2+.03,w/2-.03])box(g,.035,.035,d,x,1.72,0,wood);for(const z of [.45,.9])tube(g,[w/2+.08,0,z],[w/2+.08,1.75,z],.022,wood);for(let i=0;i<6;i++)tube(g,[w/2+.08,.13+i*.27,.45],[w/2+.08,.13+i*.27,.9],.018,wood);break;
    case 'play-tent':for(const x of [-.5,.5])for(const z of [-.5,.5])tube(g,[x,0,z],[x*.05,1.45,z*.05],.02,wood);for(const x of [-1,1]){const panel=box(g,.025,1.2,1,x*.25,.6,0,fabric,.01);panel.rotation.z=x*.38;}box(g,1,.025,1,0,.015,0,part('body',h.color,'cloth'),.04);break;
    case 'toy-blocks':for(let i=0;i<10;i++){const x=(i%4-1.5)*.11,z=(Math.floor(i/4)-1)*.11,y=i>7?.15:.05;box(g,.095,.095,.095,x,y,z,part('body',i%3===0?'#a9b391':i%3===1?'#bca077':h.color,'wood'),.008,i*.25);}break;
    case 'laundry-hamper':box(g,w,H,d,0,H/2,0,part('body',h.color,'cloth'),.06);box(g,w+.015,.035,d+.015,0,H,0,wood,.025);box(g,.12,.012,.025,0,H+.022,0,frame,.005);break;
    case 'drying-rack':for(const x of [-.47,.47]){tube(g,[x,0,-.26],[x,.88,.25],.013,metal);tube(g,[x,0,.26],[x,.88,-.25],.013,metal);}for(let i=0;i<8;i++)tube(g,[-.5,.9,-.25+i*.07],[.5,.9,-.25+i*.07],.005,metal);box(g,.35,.48,.02,-.15,.65,.14,fabric,.01);break;
    case 'tumble-dryer':box(g,w,H,d,0,H/2,0,body,.035);box(g,w-.04,.13,.015,0,H-.09,d/2,white,.008);const window=cyl(g,.2,.2,.025,0,.37,d/2+.02,dark);window.rotation.x=Math.PI/2;torus(g,.205,.022,0,.37,d/2+.035,metal);cyl(g,.027,.027,.015,.19,H-.09,d/2+.02,frame).rotation.x=Math.PI/2;break;
    case 'ironing-board':box(g,w,.055,d,0,H-.03,0,part('body',h.color,'cloth'),.16);for(const z of [-.13,.13]){tube(g,[-.4,0,z],[.3,H-.06,z],.015,metal);tube(g,[.4,0,z],[-.3,H-.06,z],.015,metal);}box(g,.2,.035,.15,.4,H+.015,0,frame,.025);break;
    case 'toothbrush-holder':cyl(g,.055,.05,.11,0,.055,0,white);for(const x of [-.023,.023]){tube(g,[x,.03,0],[x,.18,0],.006,body);box(g,.015,.04,.012,x,.19,0,fabric,.004);}break;
    default:return false;
  }
  return true;
}
