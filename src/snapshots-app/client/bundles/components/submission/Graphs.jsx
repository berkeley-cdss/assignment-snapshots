import React from "react";

import { LineChart } from "@mui/x-charts/LineChart";

function Graphs({ backupCreatedTimestamps, fileMetadata }) {
  return (
    <div>
      <h2>Assignment Insights</h2>
      <LineChart
        xAxis={[
          {
            data: backupCreatedTimestamps.map(
              (dateString) => new Date(dateString),
            ),
            scaleType: "time",
            valueFormatter: (date) => date.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
            label: "Date",
          },
        ]}
        series={[
          {
            curve: "linear",
            data: fileMetadata.num_lines,
            label: "Number of Lines of Code",
          },
        ]}
        height={300}
      />
    </div>
  );
}

export default Graphs;
