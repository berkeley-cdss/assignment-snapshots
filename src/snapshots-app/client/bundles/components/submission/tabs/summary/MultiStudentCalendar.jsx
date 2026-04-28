import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { useParams } from "react-router";
import { CircularProgress } from "@mui/material";

const MultiStudentCalendar = () => {
  const routeParams = useParams();
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    fetch(
      `/api/problem_calendar/${routeParams.courseId}/${routeParams.assignmentId}`,
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
        setCalendarData(responseData);
      });
  }, [routeParams]);

  const releaseDate = "2025-10-10";
  // TODO highlight checkpoint dates (not sure if this is possible with apache echarts in a non-janky way)
  const checkpointOneDueDate = "2025-10-16";
  const checkpointTwoDueDate = "2025-10-21";
  const dueDate = "2025-10-23";

  const option = {
    title: {
      text: "Project Worksession Heatmap (Class-Wide)",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const [date, count, name] = params.data;
        return `<b>${name}</b><br />${date}: ${count} backups`;
      },
    },
    // This controls the color of the dots based on the 'count' (index 1)
    visualMap: {
      min: 0,
      max: Math.max(...calendarData.map((val) => val[1])),
      calculable: true,
      orient: "vertical",
      right: "5%",
      top: "center",
      dimension: 1, // Point to the 'count' value in the data array
      inRange: {
        color: ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"],
      },
    },
    calendar: {
      orient: "vertical",
      top: 100,
      bottom: 40,
      left: 80,
      right: 150,
      cellSize: ["auto", "auto"], // larger for jitter grid
      range: [releaseDate, dueDate],
      itemStyle: {
        borderWidth: 0.5,
        borderColor: "#ccc",
      },
      yearLabel: { show: false },
      dayLabel: {
        firstDay: 0,
        nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      },
      monthLabel: {
        position: "start", // Places month names to the left of the grid
        margin: 20,
      },
    },

    series: [{
      type: "custom",
      coordinateSystem: "calendar",
      data: calendarData,

      renderItem: (params, api) => {
        const cellPoint = api.coord(api.value(0));
        const studentIndex = api.value(3); // index of student for this day

        // Define a grid inside the cell (e.g., 5x5 grid)
        const columns = 5;
        const spacing = 8; // Pixels between dots

        const row = Math.floor(studentIndex / columns);
        const col = studentIndex % columns;

        // Center the grid within the cell
        const startX = cellPoint[0] - (columns * spacing) / 2;
        const startY = cellPoint[1] - (columns * spacing) / 2;

        return {
          type: "circle",
          shape: {
            cx: startX + col * spacing,
            cy: startY + row * spacing,
            r: 3, // Smaller radius for high density
          },
          style: api.style()
        };
      }
    }],
  };

  return (
    <>
      {calendarData.length === 0 ? <CircularProgress /> : <div style={{ width: "100%", background: "#fff", padding: "20px" }}>
        <ReactECharts
          option={option}
          style={{ height: "500px", width: "100%" }}
        />
      </div>
      }
    </>

  );
};

export default MultiStudentCalendar;