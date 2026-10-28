export const BATH_TILES = [
  ['sage','Sage','#99a88c'],['cream','Cream','#d7cbb3'],['terracotta','Terracotta','#b78268'],['charcoal','Charcoal','#676b63'],
  ['porcelain','Porcelain','#eeeae2'],['pearl','Pearl grey','#c9ceca'],['slate','Slate','#525f68'],['ink','Ink blue','#273d51'],
  ['sky','Sky blue','#9cbfc8'],['seafoam','Seafoam','#b5cec1'],['teal','Deep teal','#387c79'],['forest','Forest green','#42634f'],
  ['olive','Olive','#7d8757'],['mint','Mint','#c3d8b8'],['sand','Sand','#c9b594'],['ochre','Ochre','#b9954d'],
  ['mustard','Mustard','#c4a34e'],['clay','Clay pink','#cc9d8d'],['blush','Blush','#e3c0b9'],['rose','Dusty rose','#b77f85'],
  ['burgundy','Burgundy','#77444e'],['lavender','Lavender','#b8adc7'],['lilac','Lilac','#d4c7db'],['black','Soft black','#303535'],
].map(([id,name,color])=>({id,name,color}));
export const isTileColor=value=>typeof value==='string'&&/^#[\da-f]{6}$/i.test(value);
export const normalizeBathTile=value=>BATH_TILES.some(t=>t.id===value)||isTileColor(value)?value:'sage';
export const bathTileColor=value=>BATH_TILES.find(t=>t.id===value)?.color||(isTileColor(value)?value:BATH_TILES[0].color);
