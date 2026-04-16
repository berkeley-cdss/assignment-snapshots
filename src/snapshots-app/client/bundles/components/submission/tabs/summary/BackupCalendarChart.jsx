import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { CircularProgress } from "@mui/material";

// TODO don't hardcode release, checkpoint 1, checkpoint 2, due date
// const highlightedDates = ["2025-10-27", "2025-11-05", "2025-11-14", "2025-11-24", "2025-11-25"];

// TODO rename charts for consistency with titles in frontend
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
    return Math.min(...keys.map((date) => new Date(date).getTime()));
  }, [rawCalendarData]);

  const endDate = useMemo(() => {
    const keys = Object.keys(rawCalendarData);
    if (keys.length === 0) return null;
    return Math.max(...keys.map((date) => new Date(date).getTime()));
  }, [rawCalendarData]);

  // generate dummy data
  const calendarData = useMemo(() => {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (
      let time = start.getTime();
      time <= end.getTime();
      time += 24 * 60 * 60 * 1000
    ) {
      const dateString = echarts.time.format(
        new Date(time),
        "{yyyy}-{MM}-{dd}",
        false,
      );
      const count = rawCalendarData[dateString] || 0;
      data.push([dateString, count]);
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
