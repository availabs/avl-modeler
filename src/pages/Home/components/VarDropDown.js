import React, { useState, useEffect, useMemo } from "react";
// import { useFalcor } from '@availabs/avl-components';
// import get from 'lodash.get'
// import flatten from 'lodash.flatten';
import VarDisplay from "./VarDisplay";
// import VarBarChart from "./VarBarChart";

const VarDropDown = ({ layer }) => {
  const [variables, setVariables] = useState({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const getVariables = async () => {
      const response = await fetch("/popsynth_vars/vars.json");
      const data = await response.json();
      console.log("meta--", data);

      setVariables(data);

      // handleChange(event) {
      //     setVariables({name: event.target.value});
      //   }
    };
    getVariables();
  }, []);

  console.log("variables---", variables, selected);

  // let variables = fetch('/popsynth_vars/vars.json')
  //              .then(r => r.json())
  //              .then(data => {
  //
  //                console.log('fdata---',data, data.HINCP.name );

  //                //  setVariables =  Object.values(data).map (d => d)
  //                // return Object.values(data).map (d => d)

  //           })

  // handleChange(event) {
  //     setVariables({name: event.target.value});
  //   }

  const colors = {
    primary: "white",
    light: "#aaa",
  };

  return (
    <div>
      <label style={{ width: "70%" }}>
        <div
          style={{
            fontSize: "1.15em",
            fontWeigh: 600,
            color: colors.primary,
            borderBottom: `2px solid ${colors.light}`,
            paddingBottom: 10,
          }}
        >
          Compare SynPop and ACS output
          {/* <h1 style={{ color: '#efefef', fontWeight: "bold" }}> Compare SynPop and ACS output</h1> */}
        </div>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            padding: 10,
            width: "100%",
            fontSize: "1em",
            color: "#3A3636",
          }}
        >
          <option key={0} value={""}>
            choose a variable
          </option>

          {Object.keys(variables).map((k, i) => {
            return (
              <option key={i} value={k}>
                {variables[k].name}
              </option>
            );
          })}
        </select>
        {variables[selected] ? (
          <VarDisplay variable={variables[selected]} layer={layer} />
        ) : (
          ""
        )}
        {/* {variables[selected] ? (
          <div style={{ height: 250 }}>
            <VarDisplay variable={variables[selected]} layer={layer} />
            <VarBarChart data={variables[selected]} />
          </div>
        ) : (
          ""
        )} */}
      </label>
    </div>
  );
};

export default VarDropDown;
