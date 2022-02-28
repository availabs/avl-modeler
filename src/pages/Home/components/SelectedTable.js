import React, { useState, useEffect, useMemo } from "react";
import { useFalcor } from "@availabs/avl-components";
import get from "lodash.get";
import SelectedBarChart from "./SelectedBarChart";

import flatten from "lodash.flatten";

const SelectedTable = ({ layer }) => {
  const { falcor, falcorCache } = useFalcor();

  console.log("ACS_layer", layer);
  let selectedBlockGroups = layer.state.selectedBlockGroups;

  //Find Syn # households and # persons
  let synHouseholds = layer.households;
  let synPersons = layer.persons;

  console.log("synHouseholds", synHouseholds);
  console.log("synPersons", synPersons);

  let householdsBgs = synHouseholds.reduce((acc, obj) => {
    acc[obj.household_id] = obj.BG;
    return acc;
  }, {});

  let personsBgs = synPersons.reduce((acc, cur) => {
    acc[`${cur.household_id}-${cur.per_num}`] = cur.BG;
    return acc;
  }, {});

  console.log("householdsBgs", householdsBgs);
  // console.log('personsBgs',  personsBgs )

  // get all the unique BGs to view selected BGs on map
  let Bgs = Object.values(householdsBgs);
  let uniqueBgsOrigin = [...new Set(Bgs)];

  console.log("householdsBgs--", householdsBgs, uniqueBgsOrigin);

  // this.props.parentCallback(uniqueBgsOrigin)

  //reformat bgIDs to standard FIPS code
  let uniqueBgs = uniqueBgsOrigin
    .filter((d) => d)
    .map((d) => `36001${d.padStart(7, "0")}`);
  // console.log('blockgroups', uniqueBgs.length)

  //reformat householdsBgs/personsBgs to BgsHouseholds/BgsPersons

  //    let BgsHouesholds =  {}
  //    for(let hhid in householdsBgs) {
  //        let bg = householdsBgs[hhid]
  //        if(!(bg in BgsHouseholds)) {
  //            BgsHouseholds[bg] =[]
  //        }
  //        BgsHouseholds[bg].push(hhid)
  //    }
  //      console.log('BgsHouseholds', BgsHouseholds)

  let BgsHouseholds = {};

  Object.keys(householdsBgs).map((hhid) => {
    let bg = householdsBgs[hhid];

    if (!(bg in BgsHouseholds)) {
      BgsHouseholds[bg] = [];
    }
    return BgsHouseholds[bg].push(hhid);
  });

  let BgsPersons = {};

  Object.keys(personsBgs).map((pid) => {
    let bg = personsBgs[pid];

    if (!(bg in BgsPersons)) {
      BgsPersons[bg] = [];
    }
    return BgsPersons[bg].push(pid);
  });

  //reformat SelectedBgs' geoid to short geoid  and filter only selected blockgroups
  let newSelectedBGs = selectedBlockGroups.map((key) =>
    parseInt(key.slice(-7)).toString()
  );

  console.log(
    "BgsHouseholds",
    BgsHouseholds,
    selectedBlockGroups,
    newSelectedBGs
  );
  console.log("BgsPersons", BgsPersons);

  let selectedBgsHouseholds = Object.keys(BgsHouseholds)
    .filter((Bg) => newSelectedBGs.includes(Bg))
    .reduce((obj, key) => {
      obj[key] = BgsHouseholds[key];
      return obj;
    }, {});

  let selectedBgsPersons = Object.keys(BgsPersons)
    .filter((Bg) => newSelectedBGs.includes(Bg))
    .reduce((obj, key) => {
      obj[key] = BgsPersons[key];
      return obj;
    }, {});

  let selectedSynHouseholds = Object.values(selectedBgsHouseholds).flat(1);
  let selectedSynPersons = Object.values(selectedBgsPersons).flat(1);

  console.log(
    "selectedBgsHouseholds",
    selectedBgsHouseholds,
    selectedSynHouseholds
  );
  console.log("selectedBgsPersons", selectedBgsPersons, selectedSynPersons);

  useEffect(() => {
    const bg_cenvars = {
      p_total: "B01003_001E", //Total	TOTAL POPULATION
      hh_total: "B25001_001E", //Total	HOUSING UNITS
      hh_inc1: "B19001_002E", //income Less than $10,000
      hh_inc2: "B19001_003E", //$10,000 to $14,999
      hh_inc3: "B19001_004E", //$15,000 to $19,999
      hh_inc4: "B19001_005E", //$20,000 to $24,999
      hh_inc5: "B19001_006E", //$25,000 to $29,999
      hh_inc6: "B19001_007E", //$30,000 to $34,999
      hh_inc7: "B19001_008E", //$35,000 to $39,999
      hh_inc8: "B19001_009E", //$40,000 to $44,999
      hh_inc9: "B19001_010E", //$45,000 to $49,999
      hh_inc10: "B19001_011E", //$50,000 to $59,999
      hh_inc11: "B19001_012E", //$60,000 to $74,999
      hh_inc12: "B19001_013E", //$75,000 to $99,999
      hh_inc13: "B19001_014E", //$100,000 to $124,999
      hh_inc14: "B19001_015E", //$125,000 to $149,999
      hh_inc15: "B19001_016E", //$150,000 to $199,999
      hh_inc16: "B19001_017E", //$200,000 or more
    };

    const tract_cenvars = {
      hh_total: "S2501_C01_001E", //Occupied housing units
      hh_size1: "S2501_C01_002E", //1-person household
      hh_size2: "S2501_C01_003E", //2-person household
      hh_size3: "S2501_C01_004E", //3-person household
      hh_size4: "S2501_C01_005E", //4-or-more-person household

      hh_work0: "B08202_002E", //No workers
      hh_work1: "B08202_003E", //1 worker
      hh_work2: "B08202_004E", //2 workers
      hh_work3: "B08202_005E", //3 or more workers

      p_total: "S0101_C01_001E", //Total population
      p_age1: "S0101_C01_002E", //Under 5 years
      p_age2: "S0101_C01_003E", //5 to 9 years
      p_age3: "S0101_C01_004E", //10 to 14 years
      p_age4: "S0101_C01_005E", //15 to 19 years
      p_age5: "S0101_C01_006E", //20 to 24 years
      p_age6: "S0101_C01_007E", //25 to 29 years
      p_age7: "S0101_C01_008E", //30 to 34 years
      p_age8: "S0101_C01_009E", //35 to 39 years
      p_age9: "S0101_C01_010E", //40 to 44 years
      p_age10: "S0101_C01_011E", //45 to 49 years
      p_age11: "S0101_C01_012E", //50 to 54 years
      p_age12: "S0101_C01_013E", //55 to 59 years
      p_age13: "S0101_C01_014E", //60 to 64 years
      p_age14: "S0101_C01_015E", //65 to 69 years
      p_age15: "S0101_C01_016E", //70 to 74 years
      p_age16: "S0101_C01_017E", //75 to 79 years
      p_age17: "S0101_C01_018E", //80 to 84 years
      p_age18: "S0101_C01_019E", //85 years and over

      p_occp1: "C24060_002E", // Management, Business, Science, and Arts Occupations
      p_occp2: "C24060_003E", // Service Occupations
      p_occp3: "C24060_004E", // Sales and Office Occupations
      p_occp4: "C24060_005E", // Natural Resources, Construction, and Maintenance Occupations
      p_occp5: "C24060_006E", // Production, Transportation, and Material Moving Occupations
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
    // let geoids= Object.keys(bgData)

    console.log("bgData", bgData, selectedBlockGroups);

    let acsData = selectedBlockGroups.map((geoid, i) => {
      // console.log('geoid', geoid, i)

      let popbaseV = get(bgData, [geoid, "2019", "B01003_001E"], 0);
      let hhbaseV = get(bgData, [geoid, "2019", "B25001_001E"], 0);

      let bgDataValue = Object.values(bgData[geoid]);
      console.log("bgDataValue", bgDataValue);

      let hhinc1V =
        bgDataValue[0].B19001_002E +
        bgDataValue[0].B19001_003E +
        bgDataValue[0].B19001_004E +
        bgDataValue[0].B19001_005E;

      // let hhinc1V = get(bgData, [geoid, '2019','B19001_002E' + 'B19001_003E' + 'B19001_004E' + 'B19001_005'],0)
      // let hhinc2V = get(bgData, [geoid,'2019', 'B19001_006E + B19001_007E+B19001_008E+B19001_009E+B19001_010'],0)
      // let hhinc3V = get(bgData, [geoid,'2019', 'B19001_011E + B19001_012E + B19001_013'],0)
      // let hhinc4V = get(bgData, [geoid,'2019', 'B19001_014E + B19001_015'],0)
      // let hhinc5V = get(bgData, [geoid,'2019', 'B19001_016'],0)
      // let hhinc6V = get(bgData, [geoid,'2019', 'B19001_017'],0)

      return {
        GEOID: geoid,
        POPBASE: popbaseV > 0 ? popbaseV : 0,
        HHBASE: hhbaseV > 0 ? hhbaseV : 0,
        HHINC1: hhinc1V > 0 ? hhinc1V : 0,
      };
    });

    // let test = acsData.filter(d => d.GEOID.includes(selectedBlockGroups))
    console.log("acsData --", acsData);

    // then filter geoid with selected blockgroup...
    // let popBaseSum = acsData.filter(d => d.GEOID.includes(selectedBlockGroups)).reduce((a, c) => +a + +c.POPBASE, 0)
    // let hhBaseSum = acsData.filter(d => d.GEOID.includes(selectedBlockGroups)).reduce((a, c) => +a + +c.HHBASE, 0)

    let popBaseSum = acsData.reduce((a, c) => +a + +c.POPBASE, 0);
    let hhBaseSum = acsData.reduce((a, c) => +a + +c.HHBASE, 0);
    let ACSValues = acsData;

    return { totalPop: popBaseSum, totalHH: hhBaseSum, acsData: ACSValues };
    // return {acsData:acsData}
  }, [selectedBlockGroups]);

  const ACS_Data = acsTotals.acsData;

  console.log("acsData", ACS_Data);

  //make an object that combines ACS total and Popsyn total

  let synPopAcsTotals = ACS_Data.map((d) => {
    let popSynHHbase = Object.keys(selectedBgsHouseholds).map((bg) => {
      // console.log("popSynHHbase", d.GEOID.slice(-6), bg)

      if (d.GEOID.slice(-6) === bg) {
        let Households = selectedBgsHouseholds[bg];
        return flatten(Households);
      }
    });

    let popSynPbase = Object.keys(selectedBgsPersons).map((bg) => {
      // console.log("popSynHHbase", d.GEOID.slice(-6), bg)

      if (d.GEOID.slice(-6) === bg) {
        let Persons = selectedBgsPersons[bg];
        return flatten(Persons);
      }
    });

    return {
      GEOID: d.GEOID,
      HHBASE_ACS: d.HHBASE,
      HHBASE_SynPop: flatten(popSynHHbase).length,
      POPBASE_ACS: d.POPBASE,
      PopBase_SybPop: flatten(popSynPbase).length,
    };
  });

  console.log("synPopAcsTotals", synPopAcsTotals);

  const colors = {
    primary: "white",
    light: "#aaa",
  };

  return (
    <div className="w-45 bg-gray-600 text-white">
      <table
        style={{ marginTop: `10px`, marginLeft: "auto", marginRight: "auto" }}
      >
        <thead>
          <tr style={{ borderBottom: `1px solid` }}>
            <th> </th>
            <th> Selected Total Counts</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="max-w-sm px-6 py-2 text-left whitespace-nowrap text-sm font-medium text-gray-300">
              Block Groups
            </td>
            <td className="max-w-sm px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
              {selectedBlockGroups.length.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="max-w-sm px-6 py-2 text-left whitespace-nowrap text-sm font-medium text-gray-300">
              SynPop Households
            </td>
            <td className="max-w-sm px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
              {selectedSynHouseholds.length.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td className="max-w-sm px-6 py-2 text-left whitespace-nowrap text-sm font-medium text-gray-300">
              SynPop Persons
            </td>
            <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
              {selectedSynPersons.length.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td className="max-w-sm px-6 py-2 text-left whitespace-nowrap text-sm font-medium text-gray-300">
              ACS Households
            </td>
            <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
              {acsTotals.totalHH.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="max-w-sm px-6 py-2 text-left whitespace-nowrap text-sm font-medium text-gray-300">
              ACS Persons
            </td>
            <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
              {acsTotals.totalPop.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
      {/* 
       <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        Selected BGs: {selectedBlockGroups.toLocaleString()}
      </div> 
      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        Number of BG selected: {selectedBlockGroups.length.toLocaleString()}
      </div>

      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        Number of SynPop Households:{" "}
        {selectedSynHouseholds.length.toLocaleString()}
      </div>

      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        Number of SynPop Persons: {selectedSynPersons.length.toLocaleString()}
      </div>

      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        ACS BG's Households: {acsTotals.totalHH.toLocaleString()}
      </div>
      <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        ACS BG's Population: {acsTotals.totalPop.toLocaleString()}
      </div> */}

      <div style={{ height: 250, width: 470 }}>
        <SelectedBarChart data={synPopAcsTotals} />
      </div>
    </div>
  );
};

export default SelectedTable;
