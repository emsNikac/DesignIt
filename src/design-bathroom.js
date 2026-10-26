import * as THREE from 'three';
import {sharedGeometry} from './mesh-optimizer.js';
export function buildDesignerBathroom(g,def,h){
  if(def.model!=='design-bathroom')return false;
  const {box,cyl,ball,tube,torus,arc,panel,part}=h,F=def.design.form,[w,H,d]=def.size;
  const white=part('ceramic','#e4e0d4','ceramic'),body=part('body',h.color,'matte'),wood=part('frame',h.color,'wood'),metal=part('hardware','#aea992','metal'),glass=part('glass','#b5c9bf','glass'),linen=part('accent','#d4cbb7','cloth'),top=part('top','#d7d2c3','marble'),dark=part('details','#6e7c70','ceramic');
  const faucet=(x,y,z)=>arc(g,[[x,y,z],[x,y+.2,z],[x,y+.22,z+.12],[x,y+.15,z+.14]],.012,metal);
  const basin=(x,y,z,r=.18)=>{cyl(g,r,r*.75,.07,x,y,z,white);cyl(g,r*.85,r*.85,.004,x,y+.037,z,dark);torus(g,r*.92,.009,x,y+.04,z,white,Math.PI/2);faucet(x,y+.02,z-.16);};
  if(F.startsWith('bath-')&&!['bath-caddy','bath-screen'].includes(F)){
    const square=['bath-square','bath-sunken'].includes(F),copper=F==='bath-copper',claw=F==='bath-claw',m=copper?part('body','#b08361','metal'):white;
    if(square)box(g,w,H*.75,d,0,H*.38,0,F==='bath-sunken'?wood:m,.04);else ball(g,0,H*.4,0,w*.49,H*.38,d*.48,m);
    const shape=h.outline(square?'rectangle':F==='bath-corner'?'hexagon':'oval',w,d),hole=h.outline(square?'rectangle':'oval',w*.82,d*.72);shape.holes.push(hole);
    const rim=sharedGeometry(`tub-rim:${F}:${w}:${d}`,()=>new THREE.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:48}));h.mesh(g,rim,m,0,H*.8,0,Math.PI/2);
    ball(g,0,H*.76,0,w*.4,.025,d*.34,part('accent','#b3c1b4','lacquer'));
    if(claw)for(const x of [-w*.35,w*.35])for(const z of [-d*.32,d*.32]){arc(g,[[x,0,z],[x*1.05,.1,z],[x,.2,z]],.025,metal);ball(g,x*1.05,.025,z,.045,.025,.035,metal);}
    if(F==='bath-slipper')ball(g,-w*.36,H*.7,0,w*.14,H*.3,d*.42,m);
    if(F==='bath-ribbed')for(let i=0;i<48;i++){const a=i*Math.PI/24;tube(g,[Math.sin(a)*w*.45,.08,Math.cos(a)*d*.44],[Math.sin(a)*w*.48,H*.75,Math.cos(a)*d*.48],.012,body);}
    if(copper)for(const x of [-w*.3,w*.3]){arc(g,[[x,H*.6,d*.45],[x,H*.86,d*.58],[x,H*.87,d*.32]],.018,metal);for(let i=0;i<10;i++)ball(g,x,H*.5+i*.018,d*.47,.006,.006,.006,metal);}
    if(F==='bath-sunken'){box(g,w+.14,.12,d+.14,0,.06,0,wood,.015);box(g,w*.75,.12,.3,0,.06,d*.6,wood,.015);}
    faucet(w*.32,H*.65,-d*.48);return true;
  }
  if(F.startsWith('vanity-')){
    const floating=F==='vanity-wall',open=['vanity-open','vanity-industrial','vanity-pedestal'].includes(F),baseY=floating?.3:.08;
    if(open){for(const x of [-w*.42,w*.42])for(const z of [-d*.36,d*.36])tube(g,[x,0,z],[x,H-.1,z],F==='vanity-pedestal'?.045:.019,F==='vanity-industrial'?metal:wood);box(g,w,.03,d,0,.22,0,wood,.005);}
    else{box(g,w,H-.18-baseY,d,0,(H-.18+baseY)/2,0,wood,F==='vanity-arch'?.08:.012);for(const x of [-w*.25,w*.25]){box(g,w*.46,H*.55,.025,x,H*.45,d/2+.01,body,.01);tube(g,[x-.07,H*.48,d/2+.03],[x+.07,H*.48,d/2+.03],.007,metal);}if(F==='vanity-fluted')for(let i=0;i<28;i++)box(g,.01,H*.6,.012,-w*.48+i*w*.96/27,H*.46,d/2+.025,wood,.003);}
    panel(g,F==='vanity-corner'?'triangle':'rectangle',w+.03,d+.03,.05,H-.1,top);
    if(F==='vanity-industrial'){tube(g,[-w*.42,.25,-d*.36],[w*.42,.25,d*.36],.018,metal);for(const x of [-w*.42,w*.42])for(const y of [.25,H*.7])torus(g,.028,.006,x,y,d*.36,metal,Math.PI/2);}
    for(const x of ['vanity-wall','vanity-double'].includes(F)?[-w*.27,w*.27]:[0])basin(x,H-.06,0,Math.min(.18,w*.22));
    return true;
  }
  if(F.startsWith('toilet-')){
    const wall=F==='toilet-wall';if(!wall)box(g,.23,.34,.3,0,.18,.03,white,.09);
    if(F==='toilet-square')box(g,.43,.16,.55,0,.4,.07,white,.07);else ball(g,0,.4,.07,.22,.12,.3,white);
    const seat=torus(g,.16,.026,0,.51,.1,body,Math.PI/2);seat.scale.y=1.25;
    if(F==='toilet-concealed')box(g,.48,.95,.13,0,.48,-.25,wood,.01);else if(F==='toilet-corner'){const tank=box(g,.38,.38,.23,0,.65,-.16,white,.03);tank.rotation.y=Math.PI/4;}else if(!wall)box(g,.4,.34,.14,0,.66,-.22,white,.035);
    box(g,.1,.055,.008,0,wall?.7:.8,-.145,metal,.008);return true;
  }
  if(F.startsWith('shower-')&&F!=='shower-caddy'){
    if(F!=='shower-double')box(g,w,.055,d,0,.028,0,white,.015);
    if(F==='shower-curved'){
      const shell=sharedGeometry(`curved-shower:${w}:${H}`,()=>new THREE.CylinderGeometry(w*.9,w*.9,H-.1,48,1,true,0,Math.PI/2));h.mesh(g,shell,glass,-w*.42,H/2,-d*.42);arc(g,Array.from({length:25},(_,i)=>[-w*.42+Math.sin(i/24*Math.PI/2)*w*.9,H-.03,-d*.42+Math.cos(i/24*Math.PI/2)*d*.9]),.012,metal);
    }else if(F!=='shower-double'){
      for(const x of [-w/2,w/2])box(g,.012,H-.06,d,x,H/2,0,glass,0);box(g,w,H-.06,.012,0,H/2,-d/2,glass,0);
      if(F==='shower-steam'){box(g,w,.07,d,0,H,0,white,.02);box(g,w*.8,H-.12,.012,0,H/2,d/2,glass,0);for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])box(g,.025,H,.025,x,H/2,z,metal,.003);}
      else{const door=box(g,w*.8,H-.1,.015,w*.18,H/2,d*.35,glass,0);door.rotation.y=.35;}
    }
    for(const x of F==='shower-double'?[-w*.3,w*.3]:[0]){tube(g,[x,.45,-d*.4],[x,H*.92,-d*.4],.014,metal);tube(g,[x,H*.92,-d*.4],[x,H*.92,-d*.12],.012,metal);cyl(g,.1,.1,.018,x,H*.9,-d*.1,metal);box(g,.14,.22,.04,x,H*.4,-d*.38,body,.015);}
    return true;
  }
  if(F.startsWith('mirror-')){
    const face=part('glass','#b8c9bf','mirror'),frame=part('frame',h.color,'metal');
    if(F==='mirror-double')for(const x of [-.22,.22]){const border=cyl(g,.21,.21,.03,x,.45,0,frame);border.rotation.x=Math.PI/2;border.scale.y=1.6;const q=cyl(g,.195,.195,.006,x,.45,.02,face);q.rotation.x=Math.PI/2;q.scale.y=1.6;}
    else if(F==='mirror-round'){for(const [r,z,m] of [[.4,0,part('shade','#ece2c8','glow')],[.37,.02,face]]){const q=cyl(g,r,r,.015,0,.4,z,m);q.rotation.x=Math.PI/2;}}
    else{box(g,.6,.7,.07,0,.4,0,frame,F==='mirror-pill'?.2:.02);box(g,.55,.65,.006,0,.4,.04,face,F==='mirror-pill'?.2:.02);if(F==='mirror-arch'){const q=cyl(g,.3,.3,.02,0,.7,0,frame);q.rotation.x=Math.PI/2;const r=cyl(g,.27,.27,.006,0,.7,.03,face);r.rotation.x=Math.PI/2;}}
    return true;
  }
  switch(F){
    case 'towel-shelf':box(g,w,.035,d,0,H*.75,0,wood);for(const x of [-w*.4,w*.4])tube(g,[x,H*.75,-d*.3],[x,H*.3,d*.2],.012,metal);tube(g,[-w*.4,H*.3,d*.2],[w*.4,H*.3,d*.2],.012,metal);for(let i=0;i<4;i++){const roll=cyl(g,.06,.06,d*.8,(i-1.5)*w*.2,H*.75+.08,0,linen);roll.rotation.x=Math.PI/2;}break;
    case 'towel-tree':cyl(g,.18,.18,.03,0,.02,0,metal);tube(g,[0,0,0],[0,H,0],.018,metal);for(let i=0;i<3;i++){const y=H*(.6+i*.17),z=(i-1)*.12;tube(g,[-w*.45,y,z],[w*.45,y,z],.012,metal);box(g,w*.35,H*.35,.015,(i-1)*.12,y-H*.16,z+.01,linen,.012);}break;
    case 'bath-caddy':box(g,w,.025,d,0,.03,0,wood,.012);for(let i=0;i<15;i++)box(g,.008,.003,d*.85,-w*.45+i*w*.9/14,.045,0,dark,.001);box(g,.18,.18,.018,0,.13,-.08,wood,.006);torus(g,.035,.006,-w*.3,.05,0,metal,Math.PI/2);break;
    case 'shower-caddy':tube(g,[0,0,0],[0,H,0],.016,metal);for(let i=0;i<3;i++){const y=.08+i*H*.35;box(g,w,.025,d,0,y,0,wood,.012);for(const x of [-w/2,w/2])tube(g,[x,y,-d/2],[x,y+.1,d/2],.006,metal);cyl(g,.025,.025,.15,-w*.2,y+.08,0,body);}break;
    case 'laundry-sorter':for(const x of [-w*.45,w*.45])for(const z of [-d*.4,d*.4])tube(g,[x,0,z],[x,H,z],.02,wood);for(let i=0;i<3;i++){const x=(i-1)*w*.31;box(g,w*.28,H*.75,d*.9,x,H*.4,0,linen,.04);box(g,w*.28,.025,d*.9,x,H*.82,0,wood,.008);}break;
    case 'linen-tower':for(const x of [-w/2,w/2])box(g,.035,H,d,x,H/2,0,wood);for(let i=0;i<6;i++){const y=.03+i*(H-.06)/5;box(g,w,.025,d,0,y,0,wood);if(i<5)for(const x of [-w*.22,w*.22]){const roll=cyl(g,w*.15,w*.15,d*.85,x,y+w*.18,0,linen);roll.rotation.x=Math.PI/2;}}break;
    case 'soap-dish':box(g,.2,.025,.12,0,.015,0,top,.025);for(let i=0;i<7;i++)box(g,.008,.006,.1,(i-3)*.022,.03,0,white,.002);box(g,.12,.025,.065,0,.047,0,body,.02);break;
    case 'brush-set':cyl(g,.06,.055,.15,0,.075,0,white);tube(g,[0,.05,0],[0,.38,0],.008,metal);ball(g,0,.13,0,.04,.045,.04,dark);torus(g,.055,.006,0,.15,0,metal,Math.PI/2);break;
    case 'step-stool':for(let i=0;i<2;i++){const height=.16+i*.14;box(g,.5,height,.2,0,height/2,(i-.5)*.19,wood,.012);for(let j=0;j<5;j++)box(g,.008,.003,.17,(j-2)*.08,height+.002,(i-.5)*.19,linen,.001);}break;
    case 'towel-warmer':for(const x of [-.25,.25])arc(g,[[x,.02,0],[x,.2,.06],[x,H-.2,.06],[x,H,0]],.018,metal);for(let i=0;i<12;i++)arc(g,[[-.25,.08+i*(H-.16)/11,.06],[0,.08+i*(H-.16)/11,.12],[.25,.08+i*(H-.16)/11,.06]],.012,metal);break;
    case 'bath-screen':for(let i=0;i<3;i++){const x=(i-1)*w*.32,z=i===1?0:.12;box(g,w*.31,H,.012,x,H/2,z,glass,0);for(const xx of [-w*.155,w*.155])tube(g,[x+xx,0,z],[x+xx,H,z],.012,metal);}break;
    case 'spa-bench':for(const x of [-w*.4,w*.4])for(const z of [-d*.35,d*.35])tube(g,[x,0,z],[x,H-.05,z],.025,wood);for(let i=0;i<8;i++)box(g,w,.04,d*.09,0,H,(i-3.5)*d*.12,wood,.006);break;
    default:throw new Error(`Unknown bathroom design ${F}`);
  }
  return true;
}
