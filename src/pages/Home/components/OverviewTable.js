import React, { useState, useEffect, useMemo } from "react";
import { useFalcor } from "@availabs/avl-components";
import get from "lodash.get";

const OverviewTable = ({ layer }) => {
  const { falcor, falcorCache } = useFalcor();

  const [stateHH, setHH] = useState("waiting"); // hook!!
  const [statePersons, setPersons] = useState("waiting");

  // const startProcess = async () => {

  //     let BgData = await generateBgs() // because fetch--promise

  //     console.log('getting data----',  BgData)

  //     setHH(BgData.totalHH)
  //     setPersons(BgData.totalPop)

  // }

  // console.log('layer', layer)
  let synHouseholds = layer.households;
  let synPersons = layer.persons;

  let householdsBgs = synHouseholds.reduce((acc, obj) => {
    acc[obj.household_id] = obj.BG;
    return acc;
  }, {});
  let householdsIncome = synHouseholds.reduce((acc, obj) => {
    acc[obj.household_id] = obj.HINCP;
    return acc;
  }, {});

  let Bgs = Object.values(householdsBgs);
  let unigueBgsOrigin = [...new Set(Bgs)];

  // this.props.parentCallback(unigueBgsOrigin)

  let uniqueBgs = unigueBgsOrigin //reformat bgIDs to standard FIPS code
    .filter((d) => d)
    .map((d) => `36001${d.padStart(7, "0")}`);
  //console.log('blockgroups', uniqueBgs)

  useEffect(() => {
    const bg_cenvars = {
      p_total: "B01003_001E",
      hh_total: "B25001_001E",
    };
    console.time("get chunked bgs");
    return falcor
      .chunk(["acs", [...uniqueBgs], [2019], [...Object.values(bg_cenvars)]], {
        chunksize: 50,
      })
      .then((d) => console.timeEnd("get chunked bgs"));
  }, [uniqueBgs]);

  let acsTotals = useMemo(() => {
    let output = falcorCache;
    console.log("falcorCache", falcorCache, Object.values(output));
    let bgData = get(falcorCache, "acs", {});
    let geoids = Object.keys(bgData);
    console.log("bgData", bgData);
    let acsData = geoids.map((geoid, i) => {
      let popbaseV = get(bgData, [geoid, "2019", "B01003_001E"], 0);
      let hhbaseV = get(bgData, [geoid, "2019", "B25001_001E"], 0);

      return {
        POPBASE: popbaseV > 0 ? popbaseV : 0,
        HHBASE: hhbaseV > 0 ? hhbaseV : 0,
      };
    });

    let popBaseSum = acsData.reduce((a, c) => +a + +c.POPBASE, 0);
    let hhBaseSum = acsData.reduce((a, c) => +a + +c.HHBASE, 0);

    return { totalPop: popBaseSum, totalHH: hhBaseSum };
  }, [falcorCache]);

  const colors = {
    primary: "white",
    light: "#aaa",
  };

  return (
    <div className="w-45 bg-gray-600 text-white">
      <div
        style={{
          fontSize: "1.2em",
          fontWeigh: 500,
          color: colors.primary,
          borderBottom: `2px solid ${colors.light}`,
        }}
      >
        Overview (total)
      </div>
      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        SynthPop Households: {synHouseholds.length.toLocaleString()}
      </div>
      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        SynthPop Persons: {synPersons.length.toLocaleString()}
      </div>
      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        Number of BlockGroups: {uniqueBgs.length}
      </div>
      {/* <button 
             onClick={startProcess} 
             className={'hover:bg-gray-700 bg-gray-400 text-white cursor-pointer p-2'}>
                Calculate HH and Pop values from ACS BGs
            </button> */}
      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        ACS Households: {acsTotals.totalHH.toLocaleString()}
      </div>
      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        ACS Population: {acsTotals.totalPop.toLocaleString()}
      </div>
    </div>
  );
};

export default OverviewTable;
