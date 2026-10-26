import {Color} from 'three';

export const FINISHES = [
  ['matte','Matte paint'],['wood','Natural wood'],['cloth','Woven fabric'],['leather','Leather'],
  ['metal','Polished metal'],['brushed','Brushed metal'],['ceramic','Glazed ceramic'],
  ['marble','Marble'],['terrazzo','Terrazzo'],['stone','Natural stone'],['lacquer','Gloss lacquer'],['glass','Clear glass'],
];
export const PART_IDS=['body','frame','top','hardware','accent','ceramic','glass','shade','details','pot','foliage','cooktop','pages'];
export const PATTERNS=['plain','stripes','checker','diamonds','shag'];
export const isColor=value=>typeof value==='string'&&/^#[\da-f]{6}$/i.test(value);

export function validateAppearance(value){
  if(value===undefined)return;
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Unsupported item appearance.');
  for(const [id,part] of Object.entries(value)){
    if(!PART_IDS.includes(id)||!part||typeof part!=='object'||Array.isArray(part)||
      Object.keys(part).some(k=>!['color','finish'].includes(k))||
      (part.color!==undefined&&!isColor(part.color))||
      (part.finish!==undefined&&!FINISHES.some(([id])=>id===part.finish)))throw new Error('Unsupported item color or finish.');
  }
}

export function partLabel(id,def){
  const names={body:'Main body',frame:'Frame & legs',top:'Top surface',hardware:'Metalwork & fittings',accent:'Accent details',ceramic:'Ceramic surfaces',glass:'Glass',shade:'Light shade',details:'Details',pot:'Planter',foliage:'Foliage',cooktop:'Cooktop',pages:'Book pages'};
  if(id==='body'&&['kitchen','island','vanity','double-vanity','wardrobe','console','dresser','nightstand'].includes(def.model))return 'Cabinetry';
  if(id==='body'&&['sofa','chair','sectional','chaise','beanbag','ottoman','ottoman-square','bed'].includes(def.model))return 'Upholstery & fabric';
  if(id==='top')return ['kitchen','island','vanity','double-vanity'].includes(def.model)?'Countertop':'Tabletop';
  if(id==='body'&&['books','bookstack'].includes(def.model))return 'Book covers';
  if(id==='accent'&&['sofa','bed','sectional','chaise'].includes(def.model))return 'Cushions & bedding';
  return names[id]||id;
}

export function appearanceKey(item){return JSON.stringify([item.color,item.appearance||{},item.pattern||null]);}

export function makeSurface(id,color,finish,appearance,resolve){
  return {isSurface:true,id,defaultColor:color,defaultFinish:finish,
    resolve:()=>resolve(appearance[id]?.color??color,appearance[id]?.finish??finish)};
}

export function collectParts(group,def){
  const parts=new Map();
  group.traverse(o=>{const p=o.userData.surface;if(p&&!parts.has(p.id))parts.set(p.id,{id:p.id,label:partLabel(p.id,def),color:`#${new Color(p.defaultColor).getHexString()}`,finish:p.defaultFinish});});
  return [...parts.values()].sort((a,b)=>PART_IDS.indexOf(a.id)-PART_IDS.indexOf(b.id));
}
