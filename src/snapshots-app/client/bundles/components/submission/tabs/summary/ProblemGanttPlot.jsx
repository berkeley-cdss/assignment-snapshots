import React, { useState, useMemo, useEffect } from "react";

import { useParams } from "react-router";

import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

// TODO API endpoint to get problems
const PROBLEMS = [
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

const ProblemGanttPlot = () => {
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
      tooltip: {
        formatter: (params) => {
          const start = params.value[1];
          const end = params.value[2];
          const diff = end - start;
          const numBackups = params.value[3];

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

          // TODO turn this into jsx instead of string?
          return `
      <div style="border-bottom: 1px solid #ccc; margin-bottom: 5px;">
        ${params.name}
      </div>
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
        bottom: 80, // This creates the gap where the slider lives
      },
      xAxis: {
        type: "time",
        position: "top",
        splitLine: { show: true },
        axisLabel: {
          hideOverlap: true,
          formatter: {
            day: "{MM}-{dd}",
            hour: "{HH}:{mm}",
            minute: "{HH}:{mm}",
            second: "{HH}:{mm}:{ss}",
            none: "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}",
          },
        },
      },
      yAxis: {
        data: PROBLEMS,
        inverse: true,
        splitLine: { show: true },
        axisLabel: {
          interval: 0, // Force show ALL problems
        },
      },
      // TODO(stretch): add another series to compare the current student with the average gantt plot of all other students
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
                // enforce min width of 5 pixels so that graph doesn't look blank
                width: Math.max(end[0] - start[0], 5),
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
          // Map to ECharts internal format
          data: timelineData.map((item) => ({
            name: item.label,
            value: [
              item.problemIndex,
              new Date(item.startTime).getTime(),
              new Date(item.endTime).getTime(),
              item.numBackups,
            ],
            itemStyle: { color: item.color },
          })),
        },
      ],
    }),
    [timelineData],
  );

  return <ReactECharts option={option} />;
};

export default ProblemGanttPlot;
