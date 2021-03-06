import React, { Component } from "react";
import * as d3 from "d3";
import { ResponsiveBar } from "@nivo/bar";

const BarChart = ({ data }) => {
  console.log("barChartdata------------------------------", data);
  return (
    <ResponsiveBar
      data={data}
      keys={[
        //category
        // 'POPBASE',
        // 'HHBASE',
        // 'HHINC1'

        "HHBASE_ACS",
        "HHBASE_SynPop",
        "POPBASE_ACS",
        "PopBase_SybPop",
      ]}
      indexBy="GEOID"
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      groupMode="grouped"
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "#38bcb2",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "#eed312",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={[
        {
          match: {
            id: "fries",
          },
          id: "dots",
        },
        {
          match: {
            id: "sandwich",
          },
          id: "lines",
        },
      ]}
      borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      //   labelTextColor={{ from: 'color', modifiers: [['brighter', 1.6]] }}
      labelTextColor="#f8f8f8"
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-left",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: 46,
          itemsSpacing: 6,
          itemWidth: 95,
          itemHeight: 21,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 10,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      animate={false}
      motionStiffness={90}
      motionDamping={15}
    />
  );
};

export default BarChart;
