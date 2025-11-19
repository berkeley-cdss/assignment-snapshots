import React from "react";

import { LineChart } from "@mui/x-charts/LineChart";
import InfoTooltip from "../common/InfoTooltip";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Tooltip } from "@mui/material";

function AssignmentProblems({ history, allProblemDisplayNames, numSolved }) {
  function getIcon(problemDisplayName) {
    const problemData = history.find(
      (p) => p.display_name === problemDisplayName,
    );
    if (problemData !== undefined && problemData.solved) {
      return (
        <Tooltip title="Solved" placement="left">
          <DoneIcon color="success" />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Unsolved" placement="left">
          <ErrorOutlineIcon color="error" />
        </Tooltip>
      );
    }
  }

  function getPercentSolved() {
    return (numSolved / allProblemDisplayNames.length) * 100;
  }

  const problems = allProblemDisplayNames.map((problemDisplayName) => (
    <div>
      {getIcon(problemDisplayName)} {problemDisplayName}
    </div>
  ));

  return (
    <div style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
      <div style={{ fontWeight: "bold" }}>
        Assignment Progress ({Math.round(getPercentSolved())}% solved)
      </div>
      <div>{problems}</div>
    </div>
  );
}

function Graphs({
  file,
  backupCreatedTimestamps,
  fileMetadata,
  numQuestionsSolved,
  numQuestionsUnsolved,
  numAttempts,
  currBackupHistory,
  allProblemDisplayNames,
  selectedBackup,
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
  const GRAPHS_TOOLTIP_INFO =
    "Visualize the student's progress over time. Note that a question may be comprised of multiple tests and an attempt is defined as running an OkPy command.";

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
      <div style={{ fontSize: "1.5rem" }}>
        Assignment Insights{" "}
        <InfoTooltip info={GRAPHS_TOOLTIP_INFO} placement="top" />
      </div>
      <AssignmentProblems
        history={currBackupHistory}
        allProblemDisplayNames={allProblemDisplayNames}
        numSolved={numQuestionsSolved[selectedBackup]}
      />
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
