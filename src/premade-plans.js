import {region,lockPlan,planGeometry,planLayout} from './floor-plans.js';

const r=region;
function make(id,name,subtitle,regions){
  const draft={version:1,name,regions,wallStyles:{},cutaway:'south-east'};
  for(const wall of planGeometry(draft).segments){
    const outdoor=!wall.indoor;
    draft.wallStyles[wall.id]=outdoor?'fence':wall.interior?(wall.length>1.3?'doorway':'solid'):(wall.aZone&&wall.bZone)?(wall.length>1.3?'archway':'solid'):wall.outward[1]<-.3||wall.outward[0]<-.3?'window':'solid';
  }
  const plan=lockPlan(draft,`plan-${id}`);return {...planLayout(plan),id,subtitle,style:'Single-floor home'};
}
export const PREMADE_LAYOUTS=[
  make('branch-hall','The Branching House','A central hall. A room for every chapter.',[
    r('hall','Central hall',-1,-6,2,12,'indoor','hall'),r('living','Living room',-8,-6,7,4),r('dining','Dining & study',-8,-2,7,4,'indoor','office'),r('bedroom','Main bedroom',-8,2,7,4,'indoor','bedroom'),
    r('kitchen','Kitchen',1,-6,6,4,'indoor','kitchen'),r('bathroom','Bathroom',1,-2,6,3,'indoor','bathroom'),r('guest','Guest bedroom',1,1,6,5,'indoor','bedroom'),r('terrace','Long terrace',-8,6,15,3,'terrace'),
  ]),
  make('garden-l','The Garden L','Two wings and a sheltered terrace.',[
    r('living','Living & dining wing',-8,-5,8,10),r('kitchen','Kitchen wing',0,-5,7,5,'indoor','kitchen'),r('bedroom','Bedroom',0,0,4,5,'indoor','bedroom'),r('bathroom','Bathroom',-3,1,3,4,'indoor','bathroom'),r('terrace','Sheltered terrace',4,0,4,4,'terrace'),
  ]),
  make('courtyard','The Courtyard Home','A green heart, open to the sky.',[
    r('north','Living & dining',-9,-7,18,4),r('west','Bedroom wing',-9,-3,6,10,'indoor','bedroom'),r('east','Kitchen & studio',3,-3,6,10,'indoor','kitchen'),r('south','Garden lounge',-3,3,6,4),
    r('bathroom','Bathroom',-9,-3,3,4,'indoor','bathroom'),r('office','Quiet office',6,2,3,5,'indoor','office'),r('garden','Open courtyard',-3,-3,6,6,'garden'),
  ]),
  make('city-gallery','The City Gallery','A long city home with a garden balcony.',[
    r('hall','Gallery hall',-1,-11,2,18,'indoor','hall'),r('bedroom','Main bedroom',-5,-11,4,6,'indoor','bedroom'),r('guest','Guest bedroom',-5,-5,4,6,'indoor','bedroom'),r('office','Home office',-5,1,4,6,'indoor','office'),
    r('bathroom','Bathroom',1,-11,4,5,'indoor','bathroom'),r('kitchen','Kitchen',1,-6,4,7,'indoor','kitchen'),r('studio','Creative studio',1,1,4,6,'indoor','office'),r('living','Living & dining',-5,7,10,4),r('terrace','Garden balcony',-5,11,10,3,'terrace'),
  ]),
  make('family-garden','The Family Garden','Bedrooms, workspaces, and a generous garden.',[
    r('hall','Family hall',-2,-7,4,14,'indoor','hall'),r('living','Living room',-9,-7,7,5),r('office','Home office',-9,-2,7,4,'indoor','office'),r('main','Main bedroom',-9,2,7,5,'indoor','bedroom'),
    r('kitchen','Kitchen & dining',2,-7,7,5,'indoor','kitchen'),r('bathroom','Family bathroom',2,-2,7,4,'indoor','bathroom'),r('kids','Children’s room',2,2,7,5,'indoor','bedroom'),r('garden','Family garden',-9,7,18,4,'garden'),
  ]),
  make('atelier-loft','The Open Atelier','Angled windows and room to invent.',[
    {id:'loft',name:'Open atelier',type:'indoor',use:'living',points:[[-9,-7],[7,-7],[10,-3],[10,5],[5,8],[-9,8]]},r('bathroom','Bathroom',-9,-7,4,4,'indoor','bathroom'),r('office','Private studio',-5,-7,5,4,'indoor','office'),r('terrace','Side terrace',10,-3,3,8,'terrace'),
  ]),
];
