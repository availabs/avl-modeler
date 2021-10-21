import { LayerContainer } from "modules/avl-map/src";
import * as turf from "@turf/turf";
import flatten from 'lodash.flatten';
import DataGenerator from "./components/DataGenerator";
//var flatten = require('lodash.flatten');

// import { isCompositeComponent } from "react-dom/test-utils";
// import { getColorRange } from "@availabs/avl-components";
// import get from "lodash.get";

class PopSynthLayer extends LayerContainer {
  // constructor(props) {
  //   super(props);
  //   console.log("constructor called");
  // }

  filters = {};

  state = {
    selectedPumas: [],
    selectedBlockGroups: [],
    selectedPumasBgs:{},
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
        "fill-opacity": 0.5,
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

  infoBoxes = [
    {
      Component: DataGenerator,
      show: true,
    },
  ];

  onHover = {
    layers: ["PUMA"],
    callback: (layerId, features, lngLat) => {
      let { GEOID10, NAMELSAD10 } = features[0].properties;
      // console.log("hover", GEOID10, NAMELSAD10, features[0]);
      return [[GEOID10]];
      // return [[NAMELSAD10], ["geoid_hover", GEOID10]];
    },
  };

  onClick = {
    layers: ["PUMA"],
    callback: (layerId, features, lngLat) => {
      let { GEOID10, NAMELSAD10 } = features[0].properties;

      //  console.log("features----", features, lngLat);
      //let values = Object.values(lngLat);
      // console.log("hover", GEOID10, NAMELSAD10, features[0]);


      // select feature on click

      let selected = this.state.selectedPumas;

      if (!selected.includes(GEOID10)) {
        this.updateState({
          selectedPumas: [...selected, GEOID10],
        });
        console.log("add", selected);
      } else {
        let removed = selected.filter((item) => item !== GEOID10);
        this.updateState({
          selectedPumas: [...removed],
        });
        console.log("remove", selected);
      }
      //show selected pumas
      this.mapboxMap.setFilter("PUMA-highlight", [
        "in",
        "GEOID10",
        ...this.state.selectedPumas,
      ]);

      /* Code goes here */
      // 1. this.mapboxMap.queryRenderedFeatures
      // 2.create turf puma geometries
      // 3.create turf bg geometries
      // 4.boolean contains of bg in puma
      // 5.map list of contained bgs into array of bg geoids
      // 6.setFilter on bgHighlight

      //1. this.mapboxMap.queryRenderedFeatures /////////////////////////////////////////////
      var selectedFeaturesPuma = this.mapboxMap
        .queryRenderedFeatures({
          layers: ["PUMA"],
        })
        .filter((d) => this.state.selectedPumas.includes(d.properties.GEOID10));
      console.log("selectedFeaturesPuma", selectedFeaturesPuma);

      // 2.create turf puma geometries /////////////////////////////////////////////////////
      let selectedFeaturesGeoidsPuma = selectedFeaturesPuma.map(
        (d) => d.properties.GEOID10
      );

      let selectedFeaturesGeometryPuma = selectedFeaturesPuma.reduce(
        (acc, feature) => {
          acc[feature.properties.GEOID10] = feature;
          return acc;
        },
        {}
      );

      let selectedFeaturesGeometryPumaOnly = Object.values(
        selectedFeaturesGeometryPuma
      );

      // let selectedFeaturesGeometry = selectedFeatures.map(
      //   (d) => d.geometry.coordinates
      // );
      console.log("selectedFeaturesGeoidsPuma", selectedFeaturesGeoidsPuma);
      console.log("selectedFeaturesGeometryPuma", selectedFeaturesGeometryPuma);
      console.log(
        "selectedFeaturesGeometryPumaOnly",
        selectedFeaturesGeometryPumaOnly,
        // JSON.stringify(selectedFeaturesGeometryPumaOnly[0])
      ); //      JSON.stringify(selectedFeaturesGeometryPumaOnly)

      let pumaGeometry = selectedFeaturesGeometryPumaOnly[0];

      //3. create turf BG geometry ////////////////////////////////////////////////////////////////


      var featuresBgs = this.mapboxMap.queryRenderedFeatures({   //change it to querySourceFeatures?
        layers: ["BG"],
      });

      // var featuresBgs = this.mapboxMap.querySourceFeatures('BG', {   
      //   sourceLayer: 'tl_2020_36_bg'
      // });

      //.filter((d) => (d.properties.GEOID = "36001004032"));
      console.log("featuresBgs", featuresBgs);

      let featuresGeometryBgs = featuresBgs.reduce((acc, feature) => {
        //let geoid = feature.map((d) => d.properties.GEOID);
        // console.log("geoid", geoid);
        // acc[geoid] = feature.geometry.coordinates;
        acc[feature.properties.GEOID] = feature
        return acc;
      }, {});

      console.log("featuresGeometryBgs", featuresGeometryBgs); //JSON.stringify(featuresGeometryBgs)

      // let featuresGeometryBgsOnly = Object.values(featuresGeometryBgs);

      // console.log(
      //   "featuresGeometryBgsOnly",
      //   featuresGeometryBgsOnly,

      //   JSON.stringify(featuresGeometryBgsOnly)
      // ); // JSON.stringify(Object.values(featuresGeometryBgs))

      // let featuresGeometryBgsOnly0 = featuresGeometryBgsOnly[0];

      //let bgGeometry = turf.polygon(featuresGeometryBgsOnly0);

      //  console.log("bgGeometry---", bgGeometry, featuresGeometryBgsOnly0);


      //4. boolean contain test  ////////////////////////////////////////////
      //5.map list of contained bgs into array of bg geoids////////////////////////////////////////////////////////////////

      //360010001002--completely contain test 
      let bgGeometry = turf.polygon([
        [
          [-73.74195098876953, 42.67751371026449],
          [-73.74040603637695, 42.67688269641377],
          [-73.73920440673828, 42.676251676155346],
          [-73.73628616333008, 42.67511582354274],
          [-73.73937606811523, 42.67031977251909],
          [-73.74521255493164, 42.672339207533525],
          [-73.74418258666992, 42.675746855335035],
          [-73.74383926391602, 42.677135102722985],
          [-73.74195098876953, 42.67751371026449],
        ],
      ]);

      // 1. manual test /////
      // let containsBgs = turf.booleanContains(pumaGeometry, bgGeometry);
      // console.log("containsBgs---", containsBgs);


      // 2.map test failed /////
      // let constainsTest = featuresGeometryBgsOnly0.map((d) =>
      //   turf.booleanContains(pumaGeometry, d[0])
      // );

      // 3.reduce test ///////

      console.time('reduceOverlap')

      //original /////
      // let containsBgs = []

      // Object.values(selectedFeaturesPuma).map((feature) => {

      //   containsBgs = Object.keys(featuresGeometryBgs)
      //     .reduce((acc, geoid) => {
      //       // console.log('check bg', geoid, featuresGeometryBgs[geoid])
      //       // //let polygon = turf.polygon(featuresGeometryBgs[geoid])
      //       let results = turf.booleanPointInPolygon(
      //         turf.centroid(featuresGeometryBgs[geoid]),
      //         feature

      //       );

      //       if (results) {
      //         acc.push(geoid)
      //       }
      //       return acc;
      //     }, []);

      // })

      // let featuresGeometryBgs = featuresBgs.reduce((acc, feature) => {
      //   //let geoid = feature.map((d) => d.properties.GEOID);
      //   // console.log("geoid", geoid);
      //   // acc[geoid] = feature.geometry.coordinates;
      //   acc[feature.properties.GEOID] = feature
      //   return acc;
      // }, {});

      // version 2 to fix 
//       let containsBgs = Object.values(selectedFeaturesPuma).map((feature) => {
        
// console.log('feature--', feature.properties.GEOID10 )

//         return Object.keys(featuresGeometryBgs)
//           .reduce((acc, geoid) => {
//             // console.log('check bg', geoid, featuresGeometryBgs[geoid])
//             // //let polygon = turf.polygon(featuresGeometryBgs[geoid])
//             let results = turf.booleanPointInPolygon(
//               turf.centroid(featuresGeometryBgs[geoid]),
//               feature

//             );

//             if (results) {
             
//             feature.properties.GEOID10 = acc.push(geoid)

//             // let selectedBgsIds =[] 
//             // selectedBgsIds.push(geoid)
//             // acc[feature.properties.GEOID10] = selectedBgsIds.push(geoid)

//             }
//             return acc;
//           }, []);
//       })


//reformat to get pumaID

      let PUMAandBgs = Object.values(selectedFeaturesPuma).reduce((acc, feature) => {
        
                      console.log('feature2', feature )
        
                  let selectedBgIds = Object.keys(featuresGeometryBgs)
                    .reduce((acc, geoid) => {
                      // console.log('check bg', geoid, featuresGeometryBgs[geoid])
                      // //let polygon = turf.polygon(featuresGeometryBgs[geoid])
                      let results = turf.booleanPointInPolygon(
                        turf.centroid(featuresGeometryBgs[geoid]),
                        feature
          
                      );
          
                      if (results) {
                      
                      feature.properties.GEOID10 = acc.push(geoid)
                      
                      // let selectedBgsIds =[] 
                      // selectedBgsIds.push(geoid)
                      // acc[feature.properties.GEOID10] = selectedBgsIds.push(geoid)
          
                      }
                      return acc;
                    }, []);

                  acc[`${feature.properties.STATEFP10}${feature.properties.PUMACE10}`] = selectedBgIds
                  return acc;
              }, {})
        



      console.timeEnd('reduceOverlap')

      let newContainsBgs = Object.values(PUMAandBgs).map(p=>p)
      // console.log('containsBgs', containsBgs, ...containsBgs, PUMAandBgs, flatten(newContainsBgs))
             

      this.updateState({
        selectedBlockGroups: flatten(newContainsBgs)
       })

       this.updateState({
        selectedPumasBgs: PUMAandBgs
       })

       console.log( 'this.state.selectedPumasBgs', this.state.selectedPumasBgs)

      //update BG state  /////////

      // let selectedBg = this.state.selectedBlockGroups;

      // instead of testing each bg, test bgs in bunch. 
      //this might cause error if one error all other won't be included.
      
      // if (!selectedBg.includes(...containsBgs)) { 
      //   this.updateState({
      //     //  selectedBlockGroups: [...selectedBg, ...containsBgs],
      //     selectedBlockGroups: flatten([...selectedBg, containsBgs]),

      //   });
      //   console.log("add", selectedBg);
      // } else {
      //   let removed = selectedBg.filter((item) => item !== containsBgs);
      //   this.updateState({
      //     selectedBlockGroups: [...removed],
      //   });
      //   console.log("remove", selectedBg);
      // }


    

     

      

      //////
      // 4. for.... in to loop object ( error ) ////
      // let containsBgs = [];
      // for (let [key, value] of Object.entries(featuresGeometryBgs)) {
      //   let results = turf.booleanContains(pumaGeometry, value);
      //   if (results)
      //     containsBgs.push(key)
      // }

      // console.log("containsBgs---", containsBgs);


      //5. setFilter BG-highlight

      var uniqbg = new Set(this.state.selectedBlockGroups)


      this.mapboxMap.setFilter("BG-highlight", [
        "in",
        "GEOID",
        //...containsBgs,
        ...uniqbg,
      ]);

      function checkIfArrayIsUnique(myArray) {
        return myArray.length === new Set(myArray).size;
      }

      console.log("is unique?", checkIfArrayIsUnique(this.state.selectedBlockGroups));




    },
  };
  // init(map) {
  //   console.log("init---", this.state, this.state.selectedPumas);
  // }

  // fetchData() {}

  render(map) {
    let filter = this.state.selectedPumas;
    console.log("map render---", this.state, this.state.selectedPumas, filter);

    // map.setFilter("fill-color", filter);

    //map.setPaintProperties set fill color to conditional based on being in selectedPuma
    // if (this.state.selectedPumas) {
    //   map.setPaintProperty("PUMA", "fill-color", "#faafee");
    // }


  }
}

const PopSynthLayerFactory = (options = {}) => new PopSynthLayer(options);

export default PopSynthLayerFactory;
