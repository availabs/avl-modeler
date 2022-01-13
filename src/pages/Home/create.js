import React from "react";
import { AvlMap } from "modules/avl-map/src";
import config from "config.json";
import { withAuth } from "@availabs/avl-components";
import PopSynthLayerFactory from "./popsynth.layer";
import PopvizLayerFactory from "./popviz.layer";

const Map = withAuth(({ mapOptions, layers }) => {
  return (
    <div className="h-screen  h-full flex-1 flex flex-col text-white">
      <AvlMap
        accessToken={config.MAPBOX_TOKEN}
        mapOptions={mapOptions}
        layers={layers}
        sidebar={{
          title: "Popsym Modeling test",
          tabs: ["layers", "styles"],
          open: true,
        }}
        customTheme={{
          menuBg: "bg-gray-600",
          bg: "bg-gray-600",
          sidebarBg: "bg-gray-800",
          accent1: "bg-gray-600",
          accent2: "bg-gray-800",
          accent3: "bg-gray-700",
          accent4: "bg-gray-500",
          menuText: "text-gray-100",

          inputBg: "bg-gray-800 hover:bg-gray-700",
          inputBgFocus: "bg-gray-700",
          itemText: "text-gray-100 hover:text-white text-sm",
          menuBgActive: "bg-transparent",

          input: "bg-gray-600 w-full text-gray-100 text-sm p-2",
        }}
      />
    </div>
  );
});

const MapPage = {
  path: "/create",
  mainNav: false,
  name: "AVAIL Modeler",
  exact: true,
  //authLevel: 0,
  layout: "Simple",
  component: {
    type: Map,
    props: {
      mapOptions: {
        zoom: 6.6,
        styles: [
          {
            name: "Light",
            // style: "mapbox://styles/am3081/ckm86j4bw11tj18o5zf8y9pou",
            style: "mapbox://styles/am3081/cjya70364016g1cpmbetipc8u",
            
            
          },
        ],
      },
      layers: [PopSynthLayerFactory()],
    },
    wrappers: ["avl-falcor"],
  },
};

const routes = [MapPage];
export default routes;
