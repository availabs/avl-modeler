import React, { useState, useEffect, useMemo } from "react";
import { useFalcor } from "@availabs/avl-components";
import get from "lodash.get";
import flatten from "lodash.flatten";

const VarDisplay = ({ variable, layer }) => {
  const [acsOutput, setAcsOutput] = useState({});

  const { falcor, falcorCache } = useFalcor();

  let synPopHH = layer.households;
  let synPopPersons = layer.persons;
  // let syntheticData = layer[variable.type]

  console.log("synPopHH", synPopHH);

  //filter out N/A
  const selectedSynPopHH = (arr) => arr.filter((el) => el[variable.var]);
  console.log("selectedSynPopHH", selectedSynPopHH(synPopHH));

  // const bins = [...variable.bins, Infinity];
  // const bins = [...variable.bins];
  const bins = [...variable.bins.map((d) => d.value)];

  console.log("bins--", bins);

  // console.log('test---', [bins.map(()=>[])], bins)

  let binnedSynPop = selectedSynPopHH(synPopHH).reduce(
    (a, c) => {
      //   let binnedSynPop = synPopHH.reduce(
      //     (a, c) => {
      // const value = c[variable.var];
      const value = parseInt(c[variable.var]);

      for (let i = 0; i < bins.length; i++) {
        if (value < bins[i] || value === bins[i]) {
          a[i].push(value);
          break;
        }
      }
      return a;
    },
    bins.map(() => [])
  );

  let householdsBgs = selectedSynPopHH(synPopHH).reduce((acc, obj) => {
    acc[obj.household_id] = obj.BG;
    return acc;
  }, {});
  //   let householdsIncome = synPopHH.reduce((acc, obj) => {
  //     acc[obj.household_id] = obj.HINCP;
  //     return acc;
  //   }, {});

  let Bgs = Object.values(householdsBgs);
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
    console.log("acsvars", acsvars);

    const vars = acs_vars.reduce((a, c) => {
      a.push(...c);
      return a;
    }, []);

    // falcor.chunk(["acs", [...uniqueBgs], [2019], vars], { chunksize: 50 });
    falcor.chunk(["acs", [...uniqueBgsTrs], [2019], vars], { chunksize: 50 });
  }, [falcorCache, uniqueBgs, uniqueBgsTrs, variable.acs_vars]);

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
  }, [falcorCache, uniqueBgs, uniqueBgsTrs, variable.acs_vars]);

  console.log(
    "binnedACS",
    binnedACS,
    binnedSynPop,
    variable.bins.length,
    variable
  );

  return variable ? (
    <div className="w-45 bg-gray-600 text-white">
      {/* <h4>{JSON.stringify(variable)}</h4> */}

      <h2>{variable.name}</h2>

      <table>
        <thead>
          <tr style={{ borderBottom: `1px solid` }}>
            <th></th>
            <th>&nbsp;&nbsp;&nbsp;SynPop Count </th>
            <th>&nbsp;&nbsp;&nbsp;ACS Count</th>
          </tr>
        </thead>
        <tbody>
          {variable.bins.map((bin, i) => {
            // {flatten(binsKeys).map((bin, i) => {
            return (
              <tr>
                <td>{bin.name}</td>
                <td>&nbsp;&nbsp;&nbsp;{binnedSynPop[i].length}</td>
                <td>&nbsp;&nbsp;&nbsp;{binnedACS[i]}</td>
              </tr>
            );
          })}
          {/* <tr>
            <td>{variable.bins[variable.bins.length - 1]}+</td>
            <td>
              &nbsp;&nbsp;&nbsp;{binnedSynPop[variable.bins.length].length}
            </td>
            <td>&nbsp;&nbsp;&nbsp;{binnedACS[variable.bins.length]}</td>
          </tr> */}
        </tbody>
      </table>
    </div>
  ) : (
    ""
  );
};

export default VarDisplay;
