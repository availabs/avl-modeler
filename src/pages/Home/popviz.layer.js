import { LayerContainer } from "modules/avl-map/src";
import Papa from 'papaparse';
import syntheticTable from './components/syntheticTable';

class PopVizLayer extends LayerContainer {
  // constructor(props) {
  //   super(props);
  //   console.log("constructor called");
  // }

  filters = {};

  state = {
    selectedPumas: [],
    selectedBlockGroups: [],
    selectedPumasBgs:{},
    synthData:{},
    BgsSynthPop:[]
  
  };


  
  sources = [
    {
      id: "pumas",
      source: {
        type: "vector",
        url: "https://tiles.availabs.org/data/census_puma10_ny_2020.json",
      },
    },
    {
      id: "bgs",
      source: {
        type: "vector",
        url: "https://tiles.availabs.org/data/census_block_groups_ny_2020.json",
      },
    },
  ];

  layers = [
    {
      id: "BG",
      "source-layer": "tl_2020_36_bg",
      source: "bgs",
      type: "fill",
      paint: {
        "fill-color": "blue",
        "fill-opacity": 0.1,
      },
    },
    {
      id: "BG-highlight",
      "source-layer": "tl_2020_36_bg",
      source: "bgs",
      type: "fill",
      paint: {
        "fill-color": "red",
        "fill-opacity": 0.3,
        "fill-outline-color": "red",
      },
      filter: ["in", "GEOID", ""],
    },

    {
      id: "PUMA",
      "source-layer": "tl_2020_36_puma10",
      source: "pumas",
      type: "fill",
      paint: {
        "fill-color": "white",
        "fill-opacity": 0.0,

      },
    },
    {
      id: "PUMA-show",
      "source-layer": "tl_2020_36_puma10",
      source: "pumas",
      type: "line",
      paint: {
        "line-color": 'white',
        "line-width": 1,

      },
    },
    {
      id: "PUMA-highlight",
      "source-layer": "tl_2020_36_puma10",
      source: "pumas",
      type: "line",
      paint: {
        "line-color": 'yellow',
        "line-width": 4,
      },
      filter: ["in", "GEOID10", ""],
    },
  ];

  // infoBoxes = [{
  //   Component: (layer) =>{ 
  //     return (
  //       <div>
  //         {this.households.length}
  //         {JSON.stringify(this.households[0])}
  //       </div>
  //     )
  //   },
  //   show: true,
  // },];

  infoBoxes = [
    {
      Component: syntheticTable,
      show: true,
    },];

  households = {};

  persons = {};


  
  onHover = {
    layers: ["PUMA"],
    callback: (layerId, features, lngLat) => {
      let { GEOID10, NAMELSAD10 } = features[0].properties;
      // console.log("hover", GEOID10, NAMELSAD10, features[0]);
      return [[GEOID10]];
      // return [[NAMELSAD10], ["geoid_hover", GEOID10]];
    },
  };


//   callbackFunction = (unigueBgsOrigin) => {
//      this.setState({BgsSynthPop:unigueBgsOrigin})
// }


  onClick = {
    layers: ["PUMA"],
    callback: (layerId, features, lngLat) => {
   
  
    },
  };
  // init(map) {
  //   console.log("init---", this.state, this.state.BgsSynthPop);
  // }

 fetchData() {
    let fetches = ['synthetic_households','synthetic_persons'].map(v => {
          return fetch(`/population/1/${v}.csv`)
            //.then parse to json
            //.then set this.households = data
            .then(r=>r.text())
            .then(d=> {
                return{
                  data: Papa.parse(d,{header:true})
                }
              })

       })

    return Promise.all([...fetches])
    
    .then(synData =>{
      
        // console.log('synData',synData, synData[0].data.data )

      this.households = synData[0].data.data
      this.persons = synData[1].data.data


    

      let synHouseholds = this.households
      let householdsBgs = synHouseholds.reduce((acc,obj)=>{
        acc[obj.household_id]=obj.BG;
        return acc;
      }, {}
      );
  
      let Bgs = Object.values(householdsBgs)
      let unigueBgsOrigin = [...new Set(Bgs)]


      let uniqueBgs = unigueBgsOrigin //reformat bgIDs to standard FIPS code
      .filter(d => d)
      .map(d => `36001${d.padStart(7,'0')}`);
      // console.log('blockgroups', uniqueBgs)


      this.updateState({
            BgsSynthPop: [...uniqueBgs],
          });    
      
    })
    
  }


  

  render(map) {
    let filter = this.state.BgsSynthPop;

    console.log("map render---",  filter);

    map.setFilter("BG-highlight", [
    "in",
    "GEOID",
    ...filter,
  ]);         

  }
}

const PopVizLayerFactory = (options = {}) => new PopVizLayer(options);

export default PopVizLayerFactory;
