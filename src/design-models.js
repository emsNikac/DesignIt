import {designHelpers} from './design-geometry.js';
import {buildSeatingTables} from './design-seating-tables.js';
import {buildStorageLighting} from './design-storage-lighting.js';
import {buildDesignerDecor} from './design-decor.js';
import {buildDesignerRug} from './designer-rugs.js';
import {buildDesignerKitchen} from './design-kitchen.js';
import {buildDesignerBedroom} from './design-bedroom.js';
import {buildDesignerBathroom} from './design-bathroom.js';

export function buildDesignModel(group,def,helpers){
  if(!def.model.startsWith('design-'))return false;
  const h=designHelpers(helpers);
  return buildSeatingTables(group,def,h)||buildStorageLighting(group,def,h)||buildDesignerDecor(group,def,h)||buildDesignerRug(group,def,h)||buildDesignerKitchen(group,def,h)||buildDesignerBedroom(group,def,h)||buildDesignerBathroom(group,def,h);
}
