import React, { useState, useMemo, useEffect } from "react";

import { useParams } from "react-router";

import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const PROBLEMS = [
  "Problem 0",
  "Problem 1",
  "Problem 2",
  "Problem 3",
  "Problem 4",
  "Problem 5",
  "Problem 6",
  "Problem 7",
  "Problem 8a",
  "Problem 8b",
  "Problem 8c",
  "Problem 9",
  "Problem 10",
  "Problem 11",
  "Problem 12",
];

const PINK = "#D81B60";
const BLUE = "#1E88E5";
const YELLOW = "#FFC107";
const DARK_GREEN = "#004D40";

const CATEGORIES = [
  { name: "Correctness Tests Passed", color: DARK_GREEN },
  { name: "Correctness Tests Failed", color: PINK },
  { name: "Unlocking Tests Passed", color: BLUE },
  { name: "Unlocking Tests Failed", color: YELLOW },
];

const BackupGanttPlot = () => {
  const [timelineData, setTimelineData] = useState([]);
  const routeParams = useParams();

  useEffect(() => {
    fetch(
      `/api/problem_timeline/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
      {
        method: "GET",
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setTimelineData(responseData);
      });
  }, [routeParams]);

  const option = useMemo(
    () => ({
      legend: {
        data: CATEGORIES.map((c) => c.name),
        bottom: 40, // Place it below the chart
        selectedMode: false,
        itemGap: 40,
      },
      tooltip: {
        formatter: (params) => {
          const start = params.value[1];
          const end = params.value[2];
          const diff = end - start;
          const numBackups = params.value[4] - params.value[3];

          // Calculate time units
          const seconds = Math.floor((diff / 1000) % 60);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const hours = Math.floor(diff / (1000 * 60 * 60));

          // Build the duration string
          let durationStr = "";
          if (hours > 0) durationStr += `${hours}h `;
          if (minutes > 0 || hours > 0) durationStr += `${minutes}m `;
          durationStr += `${seconds}s`;

          const startTimeStr = echarts.time.format(
            start,
            "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}",
            false,
          );
          const endTimeStr = echarts.time.format(
            end,
            "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}",
            false,
          );

          return `
      <strong>Duration</strong>: ${durationStr}<br/>
      <strong># of backups</strong>: ${numBackups}<br/>
      <strong>Start</strong>: ${startTimeStr}<br/>
      <strong>End</strong>: ${endTimeStr}
    `;
        },
      },
      title: { text: "Problem Timeline", left: "center" },
      // Enable zooming and panning for high-frequency data
      dataZoom: [
        {
          type: "slider",
          filterMode: "weakFilter",
          showDataShadow: false,
          bottom: 10,
        },
      ],
      grid: {
        top: 80, // Space for the title and top X-axis
        left: 100, // Space for problem labels
        right: 50, // Padding on the right
        bottom: 80, // This creates the gap where the legend and slider live
      },
      xAxis: {
        type: "value",
        name: "Backup Index",
        position: "top",
        splitLine: { show: true },
        min: "dataMin",
        max: "dataMax",
      },
      yAxis: {
        data: PROBLEMS,
        inverse: true,
        splitLine: { show: true },
        axisLabel: {
          interval: 0, // Force show ALL problems
        },
      },
      series: [
        {
          type: "custom",
          renderItem: (params, api) => {
            const categoryIndex = api.value(0);
            const start = api.coord([api.value(3), categoryIndex]);
            const end = api.coord([api.value(4), categoryIndex]);
            const height = api.size([0, 1])[1] * 0.6; // Bar height is 60% of row height

            const rectShape = echarts.graphic.clipRectByRect(
              {
                x: start[0],
                y: start[1] - height / 2,
                // enforce min width of 5 pixels so that graph doesn't look blank
                // width: Math.max(end[0] - start[0], 5),
                width: end[0] - start[0],
                height: height,
              },
              {
                x: params.coordSys.x,
                y: params.coordSys.y,
                width: params.coordSys.width,
                height: params.coordSys.height,
              },
            );

            return (
              rectShape && {
                type: "rect",
                transition: ["shape"],
                shape: rectShape,
                style: {
                  fill: api.visual("color"), // Gets the color from the itemStyle in your data
                  opacity: 0.8,
                },
              }
            );
          },
          itemStyle: { opacity: 0.8 },
          encode: { x: [3, 4], y: 0 },
          // Map to ECharts internal format
          data: timelineData.map((item) => ({
            name: item.label, // This must match CATEGORIES names for interactivity
            value: [
              item.problemIndex,
              new Date(item.startTime).getTime(),
              new Date(item.endTime).getTime(),
              item.startIndex,
              item.endIndex,
            ],
            itemStyle: { color: item.color },
          })),
        },
        ...CATEGORIES.map((cat) => ({
          name: cat.name,
          type: "bar", // Can be anything, bar works well
          itemStyle: { color: cat.color },

          // data: [], // Empty so it doesn't render bars
        })),
      ],
    }),
    [timelineData],
  );

  return (
    <div style={{ height: "800px", width: "100%" }}>
      <ReactECharts option={option} style={{ height: "100%" }} />
    </div>
  );
};

export default BackupGanttPlot;
