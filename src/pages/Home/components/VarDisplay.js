import React, { useState, useEffect, useMemo } from "react";
import { useFalcor } from "@availabs/avl-components";
import get from "lodash.get";
import VarBarChart from "./VarBarChart";
import SelectedVarBarChart from "./SelectedVarBarChart";
import SelectedTable from "./SelectedTable";

// import flatten from "lodash.flatten";

const VarDisplay = ({ variable, layer }) => {
  const [acsOutput, setAcsOutput] = useState({});
  const { falcor, falcorCache } = useFalcor();

  let synPopHH = layer.households;
  let synPopPersons = layer.persons;
  const synPopType = variable.synpop_type;

  //filter out N/A
  const selectedSynPop = (arr) => arr.filter((el) => el[variable.var]);
  // console.log(
  //   "filtered hh",
  //   synPopHH.filter((el) => !el[variable.var])
  // );

  // console.log(
  //   "filter compare",
  //   selectedSynPop(synPopHH).length,
  //   synPopHH.length
  // );

  const bins = variable.binsCompare.map((d) => Function("v", d.comp));

  let totalSelectedSynPopArray =
    synPopType === "households"
      ? selectedSynPop(synPopHH)
      : selectedSynPop(synPopPersons);

  console.log("totalSelectedSynPopArray", totalSelectedSynPopArray);

  //selectedBgs from map click

  let selectedBGs = layer.state.selectedBlockGroups;
  let selectedTrs = [...new Set(selectedBGs.map((d) => d.slice(0, 11)))];
  let selectedBGsSynPop = selectedBGs.map((key) =>
    parseInt(key.slice(-7)).toString()
  );
  let selectedSynPopArray = totalSelectedSynPopArray.filter((e) =>
    selectedBGsSynPop.includes(e.BG)
  );
  console.log("selectedSynPopArray", selectedSynPopArray);

  // let binnedSynPop = [];

  // if (!selectedBGs.length) {
  let binnedSynPop = totalSelectedSynPopArray.reduce(
    (a, c) => {
      const value = parseInt(c[variable.var]);

      for (let i = 0; i < bins.length; i++) {
        if (bins[i](value)) {
          a[i] += +1;
          break;
        }
      }
      return a;
    },
    bins.map(() => 0)
  );
  // } else {
  let selectedBinnedSynPop = selectedSynPopArray.reduce(
    (a, c) => {
      const value = parseInt(c[variable.var]);

      for (let i = 0; i < bins.length; i++) {
        if (bins[i](value)) {
          a[i] += +1;
          break;
        }
      }
      return a;
    },
    bins.map(() => 0)
  );
  // }

  let householdsBgs = totalSelectedSynPopArray.reduce((acc, obj) => {
    acc[obj.household_id] = obj.BG;
    return acc;
  }, {});

  let Bgs = Object.values(householdsBgs);

  console.log(
    "selectedBGs-----",
    selectedBGs,
    selectedBGsSynPop,
    binnedSynPop,
    totalSelectedSynPopArray,
    selectedBinnedSynPop
  );

  let unigueBgsOrigin = [...new Set(Bgs)];

  let uniqueBgs = unigueBgsOrigin //reformat bgIDs to standard FIPS code
    // .filter((d) => d)
    .map((d) => `36001${d.padStart(7, "0")}`);

  let uniqueTrs = [...new Set(uniqueBgs.map((d) => d.slice(0, 11)))];

  console.log("blockgroups", uniqueBgs, unigueBgsOrigin);
  console.log("uniqueTract", uniqueTrs);

  let uniqueBgsTrs = [...uniqueBgs, ...uniqueTrs];

  //For ACS Data
  useEffect(() => {
    const acsvars = variable.acs_vars;
    const acs_vars = Object.values(acsvars);

    const vars = acs_vars.reduce((a, c) => {
      a.push(...c);
      return a;
    }, []);

    console.log("acsvars--", acsvars, acs_vars, vars);

    // falcor.chunk(["acs", [...uniqueBgs], [2019], vars], { chunksize: 50 });
    falcor.chunk(["acs", [...uniqueBgsTrs], [2019], vars], { chunksize: 50 });
  }, [variable.acs_vars]);

  const binnedACS = useMemo(() => {
    const acsvars = variable.acs_vars;
    const acsType = variable.acs_type;
    const acs_vars = Object.values(acsvars);
    console.log("acs_vars---", acs_vars, acsType);

    let output = falcorCache;
    console.log("falcorOutputNew---", falcorCache, Object.values(output));

    return acs_vars.map((vars) => {
      //set conditional return for BGs or Trs
      if (acsType === "BG") {
        return uniqueBgs.reduce((a, geoid) => {
          // return selectedBGs.reduce((a, geoid) => {
          return (
            a +
            vars.reduce((aa, cc) => {
              const v = get(falcorCache, ["acs", geoid, "2019", cc], 0);
              // console.log("VALUE--", v);
              if (v >= 0) {
                return aa + v;
              }
              return aa;
            }, 0)
          );
        }, 0);
      }
      return uniqueBgsTrs.reduce((a, geoid) => {
        // return selectedTrs.reduce((a, geoid) => {
        return (
          a +
          vars.reduce((aa, cc) => {
            const v = get(falcorCache, ["acs", geoid, "2019", cc], 0);
            // console.log("VALUE--", v);
            if (v >= 0) {
              return aa + v;
            }
            return aa;
          }, 0)
        );
      }, 0);
    });
  }, [falcorCache, uniqueBgsTrs, variable.acs_vars]);

  const selectedBinnedACS = useMemo(() => {
    const acsvars = variable.acs_vars;
    const acsType = variable.acs_type;
    const acs_vars = Object.values(acsvars);
    console.log("acs_vars---", acs_vars, acsType);

    let output = falcorCache;
    console.log("falcorOutputNew---", falcorCache, Object.values(output));

    return acs_vars.map((vars) => {
      //set conditional return for BGs or Trs
      if (acsType === "BG") {
        // return uniqueBgs.reduce((a, geoid) => {
        return selectedBGs.reduce((a, geoid) => {
          return (
            a +
            vars.reduce((aa, cc) => {
              const v = get(falcorCache, ["acs", geoid, "2019", cc], 0);
              // console.log("VALUE--", v);
              if (v >= 0) {
                return aa + v;
              }
              return aa;
            }, 0)
          );
        }, 0);
      }
      // return uniqueBgsTrs.reduce((a, geoid) => {
      return selectedTrs.reduce((a, geoid) => {
        return (
          a +
          vars.reduce((aa, cc) => {
            const v = get(falcorCache, ["acs", geoid, "2019", cc], 0);
            // console.log("VALUE--", v);
            if (v >= 0) {
              return aa + v;
            }
            return aa;
          }, 0)
        );
      }, 0);
    });
  }, [falcorCache, uniqueBgsTrs, variable.acs_vars]);

  //useMemo dependances -- [falcorCache, uniqueBgsTrs, variable.acs_vars]

  // console.log(
  //   "binnedACS",
  //   binnedACS,
  //   binnedSynPop,
  //   variable.binsCompare.map((d) => d.name)
  // );

  //VarChartData

  let binsName = variable.binsCompare.map((d) => d.name);
  let VarChartData = [];
  let SelectedVarChartData = [];

  for (let i = 0; i < binnedSynPop.length; i++) {
    VarChartData.push({
      bins: binsName[i],
      SynPop: binnedSynPop[i],
      ACS: binnedACS[i],
    });
  }

  for (let i = 0; i < binnedSynPop.length; i++) {
    SelectedVarChartData.push({
      bins: binsName[i],
      SynPop: selectedBinnedSynPop[i],
      ACS: selectedBinnedACS[i],
    });
  }

  console.log("VarChartData", VarChartData);

  const colors = {
    primary: "white",
    light: "#aaa",
  };

  return variable ? (
    <div className="w-55 bg-gray-600 text-white">
      {/* <h4>{JSON.stringify(variable)}</h4> */}

      {/* <h2>{variable.name}</h2> */}

      <table style={{ marginTop: `10px` }}>
        <thead>
          <tr style={{ borderBottom: `1px solid` }}>
            <th></th>
            <th>&nbsp;&nbsp;&nbsp;SynPop Count ({variable.synpop_type}) </th>
            <th>&nbsp;&nbsp;&nbsp;ACS Count ({variable.acs_type})</th>
          </tr>
        </thead>
        <tbody>
          {variable.binsCompare.map((bin, i) => {
            // {flatten(binsKeys).map((bin, i) => {
            return (
              <tr>
                <td className="max-w-sm px-6 py-2 text-left whitespace-nowrap text-sm font-medium text-gray-300">
                  {bin.name}
                </td>
                <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
                  {get(binnedSynPop, i, 0).toLocaleString()}
                </td>
                <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
                  {get(binnedACS, i, 0).toLocaleString()}
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-bold text-gray-300">
              Total
            </td>
            <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-bold text-gray-300">
              {variable.binsCompare
                .reduce((out, curr, i) => {
                  out += binnedSynPop[i];
                  return out;
                }, 0)
                .toLocaleString()}
            </td>
            <td
              className="
              px-6
              py-2
              text-right
              whitespace-nowrap
              text-sm
              font-bold
              text-gray-300"
            >
              {variable.binsCompare
                .reduce((out, curr, i) => {
                  out += binnedACS[i];
                  return out;
                }, 0)
                .toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ height: 250, width: 470 }}>
        <VarBarChart data={VarChartData} />
      </div>

      {/* <div
        style={{
          fontSize: "1.2em",
          fontWeigh: 600,
          color: colors.primary,
          borderBottom: `2px solid ${colors.light}`,
          marginTop: `30px`,
        }}
      >
        Selected Data
      </div> */}
      {/* <div className="px-6 py-2 text-left whitespace-nowrap text-sm font-bold text-gray-300">
        By variable selected
      </div> */}
      <table style={{ marginTop: `10px` }}>
        <thead>
          <tr style={{ borderBottom: `1px solid` }}>
            <th></th>
            <th>&nbsp;&nbsp;&nbsp;SynPop Count ({variable.synpop_type}) </th>
            <th>&nbsp;&nbsp;&nbsp;ACS Count ({variable.acs_type})</th>
          </tr>
        </thead>
        <tbody>
          {variable.binsCompare.map((bin, i) => {
            // {flatten(binsKeys).map((bin, i) => {
            return (
              <tr>
                <td className="max-w-sm px-6 py-2 text-left whitespace-nowrap text-sm font-medium text-gray-300">
                  {bin.name}
                </td>
                <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
                  {get(selectedBinnedSynPop, i, 0).toLocaleString()}
                </td>
                <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-medium text-gray-300">
                  {get(selectedBinnedACS, i, 0).toLocaleString()}
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-bold text-gray-300">
              Total
            </td>
            <td className="px-6 py-2 text-right whitespace-nowrap text-sm font-bold text-gray-300">
              {variable.binsCompare
                .reduce((out, curr, i) => {
                  out += selectedBinnedSynPop[i];
                  return out;
                }, 0)
                .toLocaleString()}
            </td>
            <td
              className="
              px-6
              py-2
              text-right
              whitespace-nowrap
              text-sm
              font-bold
              text-gray-300"
            >
              {variable.binsCompare
                .reduce((out, curr, i) => {
                  out += selectedBinnedACS[i];
                  return out;
                }, 0)
                .toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ height: 250, width: 470 }}>
        <SelectedVarBarChart data={SelectedVarChartData} />
      </div>

      <div>
        <SelectedTable layer={layer} />
      </div>
    </div>
  ) : (
    ""
  );
};

export default VarDisplay;
