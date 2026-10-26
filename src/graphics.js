export const GRAPHICS_KEY='forma-graphics-v1';
export const GRAPHICS_PRESETS={
  original:{label:'Original',description:'The current appearance, with the full effects.',pixelRatio:1.75,shadows:2048,ao:true,aoSamples:12,fps:60},
  balanced:{label:'Balanced',description:'Lower resolution and softer shadow detail.',pixelRatio:1,shadows:1024,ao:true,aoSamples:6,fps:60},
  performance:{label:'Performance',description:'Fewer effects for integrated graphics.',pixelRatio:.75,shadows:512,ao:false,aoSamples:4,fps:30},
  battery:{label:'Battery saver',description:'Minimal GPU load for older or portable devices.',pixelRatio:.5,shadows:0,ao:false,aoSamples:4,fps:30},
};
export const DEFAULT_GRAPHICS={...GRAPHICS_PRESETS.original,preset:'original'};
export function normalizeGraphics(value){
  const input=value||{},fallback=DEFAULT_GRAPHICS;
  return {preset:Object.hasOwn(GRAPHICS_PRESETS,input.preset)?input.preset:'custom',
    pixelRatio:[.5,.75,1,1.25,1.5,1.75,2].includes(input.pixelRatio)?input.pixelRatio:fallback.pixelRatio,
    shadows:[0,512,1024,2048,4096].includes(input.shadows)?input.shadows:fallback.shadows,
    ao:typeof input.ao==='boolean'?input.ao:fallback.ao,
    aoSamples:[4,6,8,12,16].includes(input.aoSamples)?input.aoSamples:fallback.aoSamples,
    fps:[30,60].includes(input.fps)?input.fps:fallback.fps};
}
export function loadGraphics(storage){try{const value=JSON.parse(storage.getItem(GRAPHICS_KEY));return value?normalizeGraphics(value):normalizeGraphics(DEFAULT_GRAPHICS);}catch{return normalizeGraphics(DEFAULT_GRAPHICS);}}
