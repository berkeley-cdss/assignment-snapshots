import React from "react";

import { LineChart } from "@mui/x-charts/LineChart";

// TODO don't hardcode graph data

function Graphs() {
  return (
    <div>
      <h2>Assignment Insights</h2>
      <LineChart
        xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
        series={[
          {
            data: [2, 5.5, 2, 8.5, 1.5, 5],
          },
        ]}
        // width={500}
        height={300}
      />
    </div>
  );
}

export default Graphs;
