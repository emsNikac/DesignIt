export function buildDesignerKitchen(g,def,h){
  if(def.model!=='design-kitchen')return false;
  const {box,cyl,ball,tube,torus,arc,panel,part}=h,F=def.design.form,[w,H,d]=def.size;
  const body=part('body',h.color,'matte'),wood=part('frame',h.color,'wood'),metal=part('hardware','#b1ad99','brushed'),dark=part('details','#374137','matte'),white=part('ceramic','#e2dece','ceramic'),glass=part('glass','#adc3b4','glass'),top=part('top','#d6ceba','marble');
  const knob=(x,y,z,r=.022)=>{const q=cyl(g,r,r,.018,x,y,z,metal);q.rotation.x=Math.PI/2;};
  const bottle=(x,y,z,r=.028,height=.18)=>{cyl(g,r,r,height*.75,x,y+height*.375,z,body);cyl(g,r*.4,r*.75,height*.25,x,y+height*.875,z,glass);};
  const pot=(x,y,z,r=.09,height=.12)=>{cyl(g,r,r*.88,height,x,y+height/2,z,metal);cyl(g,r*1.02,r*1.02,.012,x,y+height,z,metal);ball(g,x,y+height+.015,z,.016,.015,.016,dark);for(const side of [-1,1])torus(g,r*.22,.008,x+side*r*1.15,y+height*.7,z,metal);};
  if(def.design.group==='tall'){
    const short=F==='compact-fridge',height=short?H*.55:H;
    if(['wine-cooler','open-pantry','dish-cabinet'].includes(F)){box(g,w,height,.025,0,height/2,-d/2,body);for(const x of [-w/2,w/2])box(g,.035,height,d,x,height/2,0,body);for(const y of [.025,height-.025])box(g,w,.05,d,0,y,0,body);}
    else box(g,w,height,d,0,height/2,0,body,.02);
    if(['wine-cooler','open-pantry','dish-cabinet'].includes(F)){
      if(F==='wine-cooler')box(g,w-.08,height-.1,.012,0,height/2,d/2+.01,glass,.006);
      for(let i=0;i<6;i++){const y=.12+i*(height-.25)/5;box(g,w-.07,.025,d*.8,0,y,0,wood,.004);if(F==='wine-cooler')for(let j=0;j<5;j++){const bottle=cyl(g,.035,.035,d*.6,-w*.36+j*w*.18,y+.045,0,part('accent','#6e805b','glass'));bottle.rotation.x=Math.PI/2;}if(F==='dish-cabinet')for(let j=0;j<6;j++){const plate=cyl(g,.09,.09,.014,-w*.3+j*w*.12,y+.11,.12,white);plate.rotation.z=Math.PI/2;}}
      if(F==='open-pantry')for(let i=0;i<4;i++)box(g,.02,height-.12,d,i*w/4-w*.375,height/2,0,wood,.003);
    }else if(F==='double-oven'){
      for(const y of [height*.3,height*.7]){box(g,w-.06,height*.32,.02,0,y,d/2+.015,dark,.012);box(g,w*.75,.025,.035,0,y+height*.12,d/2+.04,metal,.008);for(const x of [-w*.25,w*.25])knob(x,y+height*.22,d/2+.025);}
    }else{
      const two=F==='french-fridge';for(let i=0;i<(two?2:1);i++){const x=two?(i-.5)*w/2:0;box(g,w/(two?2:1)-.015,height*.65,.018,x,height*.66,d/2+.01,body,.012);box(g,.02,height*.25,.03,two?(i? .04:-.04):w*.35,height*.7,d/2+.035,metal,.005);}box(g,w-.025,height*.29,.018,0,height*.17,d/2+.01,body,.008);box(g,w*.55,.02,.025,0,height*.25,d/2+.03,metal,.005);
    }
    return true;
  }
  if(def.design.group==='cooker'){
    const dual=F==='double-range',retro=F==='retro-stove';box(g,w,H-.05,d,0,H/2,0,body,retro?.055:.015);box(g,w,.04,d,0,H,0,top,.008);
    for(let i=0;i<(dual?2:1);i++){const x=dual?(i-.5)*w*.45:0;box(g,w*(dual?.42:.85),H*.57,.02,x,H*.36,d/2+.01,dark,.012);box(g,w*(dual?.32:.65),.025,.035,x,H*.63,d/2+.04,metal,.008);}
    for(let i=0;i<(dual?6:4);i++){const x=-w*.35+i*w*.7/(dual?5:3);knob(x,H*.85,d/2+.03);}
    for(const x of [-w*.25,0,w*.25])for(const z of [-d*.25,d*.25]){if(F==='induction-range')cyl(g,.09,.09,.005,x,H+.024,z,dark,48);else{torus(g,.075,.012,x,H+.03,z,dark,Math.PI/2);for(const a of [0,Math.PI/2])box(g,.19,.018,.012,x,H+.045,z,metal,.002,a);}}
    if(retro){for(const x of [-w*.4,w*.4])for(const z of [-d*.35,d*.35])cyl(g,.025,.035,.08,x,.04,z,metal);box(g,w,.14,.025,0,H+.07,-d/2,body,.025);}
    return true;
  }
  if(def.design.group==='prep'){
    if(F==='corner-unit'){box(g,w,.82,d*.43,0,.41,-d*.28,body);box(g,w*.4,.82,d,-w*.3,.41,0,body);box(g,w,.05,d*.45,0,.86,-d*.28,top);box(g,w*.43,.05,d,-w*.3,.86,0,top);}
    else if(F==='breakfast-bar'){box(g,w,.08,d,0,H-.04,0,top,.015);box(g,.08,H,d,-w*.4,H/2,0,wood,.01);tube(g,[w*.36,0,0],[w*.36,H-.06,0],.035,metal);}
    else if(F==='farmhouse-sink'){box(g,w,H-.12,d,0,(H-.12)/2,0,wood,.012);for(const x of [-w*.25,w*.25]){box(g,w*.45,H*.7,.02,x,H*.4,d/2,body);knob(x,H*.4,d/2+.025);}box(g,w,.055,d,0,H-.05,0,top);box(g,w*.6,.18,d*.75,0,H-.05,.06,white,.055);ball(g,0,H+.035,.06,w*.24,.035,d*.26,dark);arc(g,[[0,H,-d*.3],[0,H+.25,-d*.3],[0,H+.28,-d*.05],[0,H+.16,0]],.016,metal);}
    else{
      const cart=F==='open-cart'||F==='bar-cart';for(const x of [-w*.42,w*.42])for(const z of [-d*.37,d*.37]){tube(g,[x,.04,z],[x,H-.06,z],.025,cart?metal:wood);if(cart){const wheel=cyl(g,.045,.045,.025,x,.045,z,dark);wheel.rotation.x=Math.PI/2;}}
      for(const y of cart?[.15,H-.07]:[.2,H-.07])box(g,w,y===H-.07?.09:.035,d,0,y,0,F==='bar-cart'?glass:wood,.015);
      if(cart)arc(g,[[w*.45,H-.1,-d*.3],[w*.55,H+.13,-d*.3],[w*.55,H+.13,d*.3],[w*.45,H-.1,d*.3]],.015,metal);
      if(F==='bar-cart'){for(const z of [-d*.4,d*.4])tube(g,[-w*.45,.25,z],[w*.45,.25,z],.008,metal);for(let i=0;i<5;i++)bottle((i-2)*w*.15,.18,0,.03,.24);}
      if(!cart){box(g,w*.55,.14,d*.8,0,H-.19,0,body);box(g,w*.25,.02,.03,0,H-.19,d*.42,metal);}
    }
    return true;
  }
  switch(F){
    case 'pizza-oven':box(g,.45,.25,.4,0,.14,0,body,.09);box(g,.34,.13,.01,0,.1,.205,dark,.04);box(g,.34,.025,.27,0,.035,.07,top,.008);cyl(g,.04,.04,.18,.12,.36,-.1,metal);break;
    case 'blender':box(g,.2,.15,.2,0,.075,0,body,.035);cyl(g,.085,.065,.25,0,.28,0,glass);cyl(g,.09,.09,.025,0,.415,0,dark);arc(g,[[.07,.18,0],[.14,.2,0],[.14,.34,0],[.08,.37,0]],.012,body);knob(0,.08,.105);break;
    case 'processor':cyl(g,.13,.14,.1,0,.05,0,body);cyl(g,.12,.12,.17,0,.19,0,glass);cyl(g,.125,.125,.025,0,.285,0,dark);cyl(g,.035,.035,.13,.04,.36,0,dark);tube(g,[0,.12,0],[0,.25,0],.01,metal);box(g,.07,.1,.08,.14,.17,0,body,.02);break;
    case 'rice-cooker':cyl(g,.14,.13,.2,0,.11,0,body);ball(g,0,.22,0,.14,.045,.14,white);box(g,.09,.04,.02,0,.11,.135,dark,.008);box(g,.09,.018,.035,0,.27,0,metal,.008);for(const x of [-.15,.15])box(g,.05,.035,.08,x,.17,0,body,.012);break;
    case 'juicer':box(g,.13,.26,.17,-.07,.13,0,body,.035);cyl(g,.075,.075,.19,0,.29,0,glass);cyl(g,.032,.032,.1,0,.435,0,dark);tube(g,[.06,.25,0],[.17,.2,0],.02,metal);cyl(g,.055,.045,.14,.17,.07,0,glass);break;
    case 'waffle':for(const y of [.035,.15]){const q=cyl(g,.15,.15,.035,0,y,y>.1?-.08:0,body);if(y>.1)q.rotation.x=.9;}for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++)if(x*x+z*z<12)box(g,.035,.01,.035,x*.035,.058,z*.035,dark,.003);arc(g,[[-.1,.17,-.13],[0,.24,-.13],[.1,.17,-.13]],.01,metal);break;
    case 'panini':box(g,.3,.055,.25,0,.04,0,body,.025);const lid=box(g,.3,.04,.24,0,.16,-.04,body,.02);lid.rotation.x=.5;for(let i=-5;i<=5;i++)box(g,.008,.006,.21,i*.023,.073,0,dark,.001);arc(g,[[-.13,.19,.05],[0,.25,.08],[.13,.19,.05]],.012,metal);break;
    case 'grinder':box(g,.18,.23,.19,0,.12,0,body,.025);cyl(g,.08,.04,.15,0,.31,0,glass);cyl(g,.083,.083,.014,0,.39,0,dark);box(g,.12,.07,.08,0,.16,.12,metal);cyl(g,.04,.035,.09,0,.05,.14,white);break;
    case 'breadmaker':box(g,.28,.28,.31,0,.14,0,body,.045);box(g,.25,.025,.29,0,.29,0,metal,.02);box(g,.13,.007,.12,0,.307,-.03,glass,.025);for(const x of [-.07,.07])knob(x,.23,.16,.012);break;
    case 'french-press':cyl(g,.075,.075,.25,0,.13,0,glass);for(const y of [.02,.25])torus(g,.077,.008,0,y,0,metal,Math.PI/2);tube(g,[0,.02,0],[0,.34,0],.006,metal);ball(g,0,.35,0,.02,.014,.02,dark);arc(g,[[.08,.05,0],[.13,.07,0],[.13,.22,0],[.08,.24,0]],.012,dark);break;
    case 'dripper':box(g,.3,.025,.2,0,.015,0,wood,.015);tube(g,[-.11,.02,0],[-.11,.4,0],.012,metal);tube(g,[-.11,.4,0],[.07,.4,0],.012,metal);cyl(g,.08,.015,.1,.04,.34,0,white);cyl(g,.06,.075,.16,.04,.11,0,glass);break;
    case 'knife-block':const block=box(g,.2,.15,.16,0,.08,0,wood,.012);block.rotation.x=-.1;for(let i=0;i<5;i++){const x=(i-2)*.035;box(g,.018,.12,.006,x,.2,0,metal,.001);box(g,.022,.07,.012,x,.285,0,dark,.006);}break;
    case 'spice-rack':for(let row=0;row<3;row++){const y=.04+row*.07,z=-row*.08;box(g,.38,.025,.09,0,y,z,wood);for(let i=0;i<5;i++){const x=(i-2)*.07;cyl(g,.025,.025,.085,x,y+.05,z,glass);cyl(g,.027,.027,.012,x,y+.1,z,body);}}break;
    case 'pots':for(let i=0;i<3;i++)pot((i-1)*.1,.02+i*.09,0,.1-i*.014,.1);break;
    case 'breadbox':box(g,.34,.05,.25,0,.025,0,wood,.015);for(let i=0;i<16;i++){const a=i/15*Math.PI/2;box(g,.34,.018,.025,0,.05+Math.sin(a)*.17,-.11+Math.cos(a)*.2,wood,.005);}box(g,.1,.014,.025,0,.13,.1,metal,.005);break;
    case 'pitcher':cyl(g,.075,.09,.24,0,.13,0,glass);arc(g,[[.07,.04,0],[.14,.06,0],[.14,.21,0],[.07,.24,0]],.012,glass);box(g,.04,.015,.04,-.07,.25,0,glass,.012);break;
    case 'wine-rack':for(let row=0;row<3;row++)for(let col=0;col<3;col++){const x=(col-1)*.1+(row%2)*.04,y=.07+row*.09;const cell=cyl(g,.055,.055,.2,x,y,0,wood,6);cell.rotation.x=Math.PI/2;const end=cyl(g,.037,.037,.01,x,y,.105,dark,24);end.rotation.x=Math.PI/2;}break;
    case 'utensil-rail':tube(g,[-.4,.45,0],[.4,.45,0],.015,metal);for(let i=0;i<7;i++){const x=(i-3)*.11;torus(g,.025,.004,x,.43,.015,metal);tube(g,[x,.4,.02],[x,.16,.02],.006,wood);ball(g,x,.13,.02,.025,.045,.008,metal);}break;
    case 'pot-hanger':for(const x of [-.35,.35])tube(g,[x,.2,0],[x,.6,0],.006,metal);for(const z of [-.22,.22])tube(g,[-.4,.25,z],[.4,.25,z],.012,metal);for(let i=0;i<5;i++){const x=(i-2)*.15;tube(g,[x,.25,0],[x,.1,0],.004,metal);pot(x,0,0,.07,.07);}break;
    case 'baking-dishes':for(let i=0;i<3;i++){box(g,.35-i*.04,.045,.25-i*.025,(i-1)*.025,.025+i*.035,0,white,.04);for(const x of [-1,1])box(g,.045,.014,.08,x*(.18-i*.02)+(i-1)*.025,.05+i*.035,0,metal,.012);}break;
    case 'canisters':for(let i=0;i<3;i++){const x=(i-1)*.12,height=.15+i*.04;cyl(g,.05,.05,height,x,height/2,0,white);cyl(g,.053,.053,.018,x,height+.01,0,wood);ball(g,x,height+.025,0,.014,.012,.014,wood);}break;
    case 'plate-warmer':box(g,.4,.12,.3,0,.06,0,body,.015);box(g,.37,.085,.015,0,.065,.16,metal,.006);box(g,.23,.012,.025,0,.09,.18,dark,.004);for(let i=0;i<4;i++)cyl(g,.12,.11,.012,0,.13+i*.012,0,white);break;
    case 'sous-vide':box(g,.3,.2,.25,0,.1,0,glass,.025);cyl(g,.028,.028,.31,-.1,.24,-.07,metal);box(g,.075,.1,.06,-.1,.4,-.07,dark,.02);break;
    case 'tea-urn':cyl(g,.12,.1,.3,0,.24,0,metal);cyl(g,.13,.13,.03,0,.4,0,body);for(const x of [-.11,.11])arc(g,[[x,.1,0],[x*1.3,.2,0],[x,.32,0]],.012,wood);tube(g,[0,.17,.1],[0,.17,.18],.012,metal);box(g,.08,.015,.02,0,.2,.17,dark);for(const x of [-.08,.08])tube(g,[x,0,0],[x,.1,0],.015,metal);break;
    default:throw new Error(`Unknown kitchen design ${F}`);
  }
  return true;
}
