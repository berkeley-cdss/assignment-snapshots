import React from "react";

import { LineChart } from "@mui/x-charts/LineChart";

function Graphs({ fileMetadata }) {
  return (
    <div>
      <h2>Assignment Insights</h2>
      <LineChart
        xAxis={[
          {
            data: fileMetadata.created.map(
              (dateString) => new Date(dateString),
            ),
            scaleType: "time",
            valueFormatter: (date) => date.toLocaleDateString(),
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
