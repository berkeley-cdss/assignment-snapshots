import React from "react";

import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const ProblemGanttPlot = () => {
  const problems = [
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

  const timelineData = [
    {
      problemIndex: 0,
      startTime: "2026-04-14T10:00:00Z",
      endTime: "2026-04-14T10:00:15Z",
      label: "Session 1",
    },
    {
      problemIndex: 0,
      startTime: "2026-04-14T10:00:25Z",
      endTime: "2026-04-14T10:00:45Z",
      label: "Session 2",
    },
    {
      problemIndex: 1,
      startTime: "2026-04-14T10:00:05Z",
      endTime: "2026-04-14T10:00:30Z",
      label: "Session 3",
    },
    {
      problemIndex: 7,
      startTime: "2026-04-14T10:01:00Z",
      endTime: "2026-04-14T10:01:20Z",
      label: "Session 4",
    },
    {
      problemIndex: 8,
      startTime: "2026-04-14T10:01:05Z",
      endTime: "2026-04-14T10:01:40Z",
      label: "Session 5",
    },
    {
      problemIndex: 9,
      startTime: "2026-04-14T10:01:15Z",
      endTime: "2026-04-14T10:01:55Z",
      label: "Session 6",
    },
  ];

  // Map to ECharts internal format
  const data = timelineData.map((item) => ({
    name: item.label,
    value: [
      item.problemIndex,
      new Date(item.startTime).getTime(),
      new Date(item.endTime).getTime(),
    ],
    itemStyle: { color: "#5470c6" },
  }));

  const option = {
    tooltip: {
      formatter: (params) => {
        // value[1] is start, value[2] is end
        const start = echarts.time.format(
          params.value[1],
          "{HH}:{mm}:{ss}",
          false,
        );
        const end = echarts.time.format(
          params.value[2],
          "{HH}:{mm}:{ss}",
          false,
        );
        return `${params.name}<br/>${start} - ${end}`;
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
      bottom: 80, // This creates the gap where the slider lives
    },
    xAxis: {
      type: "time",
      position: "top",
      splitLine: { show: true },
      axisLabel: { formatter: "{HH}:{mm}:{ss}" },
    },
    yAxis: {
      data: problems,
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
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.6; // Bar height is 60% of row height

          const rectShape = echarts.graphic.clipRectByRect(
            {
              x: start[0],
              y: start[1] - height / 2,
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
        encode: { x: [1, 2], y: 0 },
        data: data,
      },
    ],
  };

  return <ReactECharts option={option} />;
};

export default ProblemGanttPlot;
