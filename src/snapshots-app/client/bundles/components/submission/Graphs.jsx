import React from "react";

import { LineChart } from "@mui/x-charts/LineChart";

function Graphs({ file, backupCreatedTimestamps, fileMetadata, numQuestionsSolved }) {

  return (
    <div>
      <div style={{ fontSize: "1.5rem" }}>Assignment Insights</div>
      <LineChart
        xAxis={[
          {
            data: backupCreatedTimestamps.map(
              (dateString) => new Date(dateString),
            ),
            scaleType: "time",
            valueFormatter: (date) =>
              date.toLocaleString("en-US", {
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
            label: `# of lines in ${file}`,
          },
        ]}
        height={300}
      />
      <LineChart
        xAxis={[
          {
            data: backupCreatedTimestamps.map(
              (dateString) => new Date(dateString),
            ),
            scaleType: "time",
            valueFormatter: (date) =>
              date.toLocaleString("en-US", {
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
            data: numQuestionsSolved,
            label: "# of questions solved",
          },
        ]}
        height={300}
      />
    </div>
  );
}

export default Graphs;
