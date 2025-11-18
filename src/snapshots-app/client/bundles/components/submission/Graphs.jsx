import React from "react";

import { LineChart } from "@mui/x-charts/LineChart";

function Graphs({
  file,
  backupCreatedTimestamps,
  fileMetadata,
  numQuestionsSolved,
  numQuestionsUnsolved,
  numAttempts,
}) {
  const dates = backupCreatedTimestamps.map(
    (dateString) => new Date(dateString),
  );
  const xAxis = [
    {
      data: dates,
      scaleType: "time",
      valueFormatter: formatDate,
      label: "Date",
    },
  ];
  const height = 300;

  function formatDate(date) {
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return (
    <div>
      <div style={{ fontSize: "1.5rem" }}>Assignment Insights</div>
      <LineChart
        xAxis={xAxis}
        series={[
          {
            curve: "linear",
            data: fileMetadata.num_lines,
            label: `# of lines in ${file}`,
          },
        ]}
        height={height}
      />
      <LineChart
        margin={{ top: 100 }}
        xAxis={xAxis}
        series={[
          {
            curve: "linear",
            data: numQuestionsSolved,
            label: "# of questions solved",
          },
          {
            curve: "linear",
            data: numQuestionsUnsolved,
            label: "# of questions unsolved",
          },
        ]}
        height={height}
      />
      <LineChart
        xAxis={xAxis}
        series={[
          {
            curve: "linear",
            data: numAttempts,
            label: "# of attempts",
          },
        ]}
        height={height}
      />
    </div>
  );
}

export default Graphs;
