import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const BackupCalendarChart = ({
  startDate = "2026-11-01",
  endDate = "2026-11-30",
}) => {
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
      const count = Math.random() > 0.5 ? Math.floor(Math.random() * 20) : 0;
      data.push([dateString, count]);
    }
    return data;
  }, [startDate, endDate]);

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
    <div style={{ height: calculateHeight(), width: "100%" }}>
      <ReactECharts
        option={option}
        style={{ height: "100%" }}
        notMerge={true}
      />
    </div>
  );
};

export default BackupCalendarChart;
