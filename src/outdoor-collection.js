const families={
  seat:[
    ['adirondack','Lakeside Adirondack chair',[.8,1.05,.95]],['bistro','Foldaway bistro chair',[.5,.85,.55]],['sling','Canvas sling lounger',[.75,.75,1.8]],['hammock','Freestanding woven hammock',[2.8,1.3,1.1]],['daybed','Garden canopy daybed',[2.2,2.2,1.6]],['swing','Porch swing bench',[2.3,2.2,1.2]],['parkbench','Classic park bench',[1.8,.9,.7]],['curvedbench','Crescent garden bench',[2,.6,1]],['stump','Carved timber garden stool',[.5,.5,.5]],['sectional','Corner patio sofa',[2.5,.85,2]],
  ],
  shelter:[
    ['pergola','Open-beam timber pergola',[3.4,3,3]],['gazebo','Octagonal garden gazebo',[3.6,3,3.6]],['umbrella','Offset patio umbrella',[2.6,2.7,2.6]],['sail','Triangular shade sail',[3,2.7,2.8]],['trellis','Diamond climbing trellis',[1.6,2.2,.18]],['arch','Rose garden arch',[1.6,2.7,.7]],['canopy','Striped market canopy',[3,2.8,2.3]],['greenhouse','Glass potting greenhouse',[2.4,2.7,2.2]],['arbor','Garden arbor seat',[2,2.4,.8]],['screen','Folding outdoor privacy screen',[2,1.8,.2]],
  ],
  boundary:[
    ['picket','Pointed picket fence',[2,1.1,.14]],['horizontal','Horizontal cedar fence',[2,1.6,.16]],['vertical','Tall timber slat fence',[2,1.8,.14]],['rope','Coastal rope fence',[2,1,.16]],['wire','Garden wire fence',[2,1.3,.08]],['lattice','Woven lattice fence',[2,1.5,.15]],['stone','Dry-stone garden wall',[2,1,.35]],['brick','Brick garden boundary',[2,1.2,.25]],['gate','Arched garden gate',[1.2,1.6,.18]],['glassrail','Glass terrace railing',[2,1.1,.08]],
  ],
  plant:[
    ['canopy','Mature shade tree',[2.8,3.8,2.8]],['conifer','Layered cedar tree',[1.5,3.1,1.5]],['palm','Terrace fan palm',[2.2,3.2,2.2]],['hedge','Box hedge section',[1.8,1.2,.65]],['flowers','Wildflower trough',[1.2,.6,.45]],['vegetables','Raised vegetable bed',[1.8,.75,1.2]],['topiary','Spiral topiary planter',[.7,1.8,.7]],['bamboo','Bamboo garden cluster',[1.1,2.4,.65]],['rose','Climbing rose frame',[1.4,2.1,.45]],['hanging','Hanging flowering basket',[.6,.9,.6]],
  ],
  ground:[
    ['grass','Square grass patch',[2,.025,2]],['roundgrass','Circular lawn patch',[2,.025,2]],['gravel','Gravel garden island',[2,.035,1.5]],['brickpath','Brick garden path',[1,.035,2.5]],['stonepath','Paved garden walkway',[1.4,.04,2.8]],['deck','Timber deck platform',[2.4,.16,2.4]],['road','Straight asphalt lane',[2.6,.035,3]],['curve','Curved asphalt path',[2.7,.035,2.7]],['steps','Stepping-stone trail',[.9,.06,2.5]],['flagstone','Irregular flagstone patch',[2,.05,1.8]],
  ],
  amenity:[
    ['grill','Lidded garden barbecue',[1.1,1.15,.65]],['firepit','Stone-ring fire pit',[1.2,.45,1.2]],['fountain','Tiered garden fountain',[1.3,1.6,1.3]],['birdbath','Pedestal birdbath',[.65,.9,.65]],['hottub','Timber outdoor hot tub',[2,1,2]],['pond','Lily garden pond',[2,.2,1.5]],['waterwall','Cascading water wall',[1.5,1.7,.45]],['kitchen','Outdoor cooking counter',[2.2,1.1,.7]],['compost','Slatted compost bin',[1.1,1.1,1.1]],['rainbarrel','Rainwater barrel',[.7,1.2,.7]],
  ],
  accent:[
    ['bollard','Low garden bollard light',[.25,.8,.25]],['lantern','Caged patio lantern',[.35,.6,.35]],['string','Festoon light posts',[3,2.5,.45]],['solar','Solar garden lamp post',[.45,2.2,.45]],['sconce','Hooded outdoor wall light',[.35,.45,.25]],['torch','Garden fire torch',[.25,1.6,.25]],['sundial','Stone garden sundial',[.6,.85,.6]],['sculpture','Loop garden sculpture',[.8,1.5,.5]],['birdhouse','Post-mounted birdhouse',[.5,1.7,.5]],['insecthotel','Garden insect hotel',[.8,1.3,.35]],
  ],
  leisure:[
    ['picnic','Timber picnic table & benches',[2,.8,1.7]],['sandbox','Canopied children’s sandpit',[1.8,1.6,1.8]],['playswing','A-frame garden swing',[2.6,2.5,1.8]],['slide','Garden slide & ladder',[1.2,1.5,2.4]],['trampoline','Round garden trampoline',[2.5,.8,2.5]],['basketball','Freestanding basketball hoop',[1.1,3,.9]],['shed','Gabled garden tool shed',[2.1,2.6,1.8]],['bikerack','Three-space bicycle rack',[1.6,.7,.7]],['barrow','Garden wheelbarrow',[.7,.7,1.3]],['hose','Hose reel & watering can',[.65,.6,.5]],
  ],
};
export const OUTDOOR_ITEMS=Object.entries(families).flatMap(([family,entries])=>entries.map(([form,name,size])=>({id:`outdoor-${family}-${form}`,name,category:'outdoor',model:`outdoor-${family}`,design:{form},size,fit:true,outdoor:true,color:family==='plant'?'#728653':family==='ground'?'#a8aa8c':'#ac8c62',finish:family==='plant'?'Living foliage & natural planters':family==='ground'?'Outdoor ground surface':'Weathered timber, stone & metal',...(family==='ground'?{rug:true}:{}),...(form==='hanging'?{ceiling:true}:{}),...(form==='sconce'?{wall:true}:{}),...(['bollard','lantern','string','solar','sconce','torch'].includes(form)?{emitsLight:true}:{}),...(form==='picnic'?{tableSupport:true}:{})})));
