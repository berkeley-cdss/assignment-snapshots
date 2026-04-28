import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

const MultiStudentCalendar = () => {
  // Dummy Data: Simulating the schema { [date]: { [studentName]: count } }
  const rawData = {
    "2024-03-01": { "Alice": 12, "Bob": 5, "Charlie": 2 },
    "2024-03-02": { "Alice": 2, "Bob": 15, "Charlie": 8 },
    "2024-03-05": { "Alice": 20, "Bob": 1, "Charlie": 5 },
    "2024-03-10": { "Alice": 5, "Bob": 5, "Charlie": 5 },
    "2024-03-15": { "Alice": 8, "Bob": 12, "Charlie": 25 },
  };
  const startDate = "2024-03-01";
  const endDate = "2024-03-31";

  // Flatten data for ECharts scatter series
  // Format: [ [date, count, studentName], ... ]
  const scatterData = useMemo(() => {
    const points = [];
    const sortedDates = Object.keys(rawData).sort((a, b) => new Date(a) - new Date(b));

    sortedDates.forEach((date) => {
      const studentCounts = rawData[date];
      const sortedStudents = Object.keys(studentCounts).sort();

      sortedStudents.forEach((name, localIndex) => {
        // We add the localIndex as the 4th element [3]
        points.push([date, studentCounts[name], name, localIndex]);
      });
    });

    return points;
  }, [rawData]);


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
      max: 25,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 20,
      dimension: 1, // Point to the 'count' value in the data array
      inRange: {
        color: ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"],
      },
    },
    calendar: {
      orient: "vertical",
      top: 80,
      left: 30,
      right: 30,
      cellSize: [50, 50], // larger for jitter grid
      range: [startDate, endDate],
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
      data: scatterData,

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
    <div style={{ width: "100%", background: "#fff", padding: "20px" }}>
      <ReactECharts
        option={option}
        style={{ height: "500px", width: "100%" }}
      />
    </div>
  );
};

export default MultiStudentCalendar;