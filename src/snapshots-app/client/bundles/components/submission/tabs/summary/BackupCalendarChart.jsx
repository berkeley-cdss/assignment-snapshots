import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { CircularProgress } from "@mui/material";

const BackupCalendarChart = () => {
  const routeParams = useParams();
  const [rawCalendarData, setRawCalendarData] = useState([]);

  useEffect(() => {
    fetch(
      `/api/problem_calendar/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
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
        setRawCalendarData(responseData);
      });
  }, [routeParams]);

  const startDate = useMemo(() => {
    const keys = Object.keys(rawCalendarData);
    if (keys.length === 0) return null;
    // Sort alphabetically to get the earliest string
    return keys.sort()[0];
  }, [rawCalendarData]);

  const endDate = useMemo(() => {
    const keys = Object.keys(rawCalendarData);
    if (keys.length === 0) return null;
    // Sort alphabetically to get the latest string
    return keys.sort()[keys.length - 1];
  }, [rawCalendarData]);

  const calendarData = useMemo(() => {
    if (!startDate || !endDate) return [];
    const data = [];
    let curr = new Date(startDate + "T00:00:00"); // Force local time start
    const last = new Date(endDate + "T00:00:00");

    while (curr <= last) {
      const dateString = echarts.time.format(curr, "{yyyy}-{MM}-{dd}", false);
      data.push([dateString, rawCalendarData[dateString] || 0]);
      curr.setDate(curr.getDate() + 1); // Native way to increment day
    }
    return data;
  }, [rawCalendarData, startDate, endDate]);

  const option = useMemo(
    () => ({
      title: { text: "Project Worksession Heatmap", left: "center" },
      tooltip: {
        formatter: (params) => `${params.value[0]}: ${params.value[1]} backups`,
      },
      visualMap: {
        min: 0,
        max: Math.max(...calendarData.map((val) => val[1])),
        calculable: true,
        orient: "vertical",
        right: "5%",
        top: "center",
        // Standard GitHub-style greens
        inRange: {
          color: ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"],
        },
      },
      calendar: {
        top: 100,
        bottom: 40,
        left: 80,
        right: 150,
        orient: "vertical",
        range: [startDate, endDate],
        cellSize: [40, "auto"],
        yearLabel: { show: false },
        dayLabel: {
          firstDay: 1,
          nameMap: "en",
        },
        monthLabel: {
          position: "start", // Places month names to the left of the grid
          margin: 20,
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: "#fff",
        },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: calendarData,
        },
      ],
    }),
    [calendarData, startDate, endDate],
  );

  // Adjust container height dynamically based on the range
  const calculateHeight = () => {
    const months =
      new Date(endDate).getMonth() - new Date(startDate).getMonth() + 1;
    return Math.max(months * 180, 400) + "px";
  };

  return (
    <>
      {calendarData.length === 0 || startDate === null || endDate === null ? (
        <CircularProgress />
      ) : (
        <div style={{ height: calculateHeight(), width: "100%" }}>
          <ReactECharts
            option={option}
            style={{ height: "100%" }}
            notMerge={true}
          />
        </div>
      )}
    </>
  );
};

export default BackupCalendarChart;
