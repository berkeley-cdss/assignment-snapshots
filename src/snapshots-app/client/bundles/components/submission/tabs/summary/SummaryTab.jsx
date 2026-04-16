import React, { useState, useEffect, useMemo } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime,
  Save,
  Error,
  LeaderboardSharp,
  Timer,
  Check,
} from "@mui/icons-material";

import { useParams } from "react-router";

import StatisticsDashboard from "./StatisticsDashboard";
import ProblemGanttPlot from "./ProblemGanttPlot";
// import ProblemTimeline from "./ProblemTimeline";
// import GanttPlot from "./GanttPlot";
import InfoTooltip from "../../../common/InfoTooltip";

// TODO: move graphs from Submission Layout into here
// TODO: lines added/removed rich git diff chart like encourse

// TODO: problem summaries [subtasks]
// TODO: number of backups for each problem
// TODO: plot time spent on unlocking vs correctness tests for each problem

// TODO: radar plot

// TODO: don't hardcode these options for just ants
const SCORE_HISTOGRAM_OPTIONS = {
  histogram: {
    bucketSize: 10,
    minValue: 0,
    maxValue: 50,
  },

  hAxis: {
    // manually sets the scale of the X-axis
    viewWindow: {
      min: 0,
      max: 50,
    },
  },
  legend: { position: "none" },
};

const PROBLEMS_SOLVED_HISTOGRAM_OPTIONS = {
  histogram: {
    bucketSize: 5,
    minValue: 0,
    maxValue: 15,
  },

  hAxis: {
    // manually sets the scale of the X-axis
    viewWindow: {
      min: 0,
      max: 15,
    },
  },
  legend: { position: "none" },
};

function SummaryTab({}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const routeParams = useParams();
  const [summaryStats, setSummaryStats] = useState(null);
  const [backupData, setBackupData] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);

  useEffect(() => {
    fetch(
      `/api/summary_statistics/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
      { method: "GET" },
    )
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => setSummaryStats(data));
  }, [routeParams]);

  useEffect(() => {
    fetch(
      `/api/backups/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
    )
      .then((res) => res.json())
      .then((data) => setBackupData(data));
  }, [routeParams]);

  useEffect(() => {
    fetch(
      `/api/backup_file_metadata/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
    )
      .then((res) => res.json())
      .then((data) => setFileMetadata(data));
  }, [routeParams]);

  const backupTimestamps =
    backupData?.backups.map((b) => new Date(b.created)) ?? [];
  const xAxis = [{ data: backupTimestamps, scaleType: "time", label: "Date" }];
  const height = 300;

  const firstFile = fileMetadata
    ? Object.keys(fileMetadata.files_to_metadata)[0]
    : null;
  const numLines = firstFile
    ? fileMetadata.files_to_metadata[firstFile].num_lines
    : [];

  const numQuestionsSolved =
    backupData?.backups.map((b) => b.history.filter((h) => h.solved).length) ??
    [];
  const numQuestionsUnsolved =
    backupData?.backups.map((b) => b.history.filter((h) => !h.solved).length) ??
    [];
  const numAttempts =
    backupData?.backups.map((b) =>
      b.history.reduce((sum, h) => sum + (h.attempts ?? 0), 0),
    ) ?? [];

  const menuItems = useMemo(
    () =>
      summaryStats
        ? [
            {
              text: "Score",
              icon: <LeaderboardSharp />,
              component: (
                <StatisticsDashboard
                  title="Score"
                  tooltip="Hover over chart for more details"
                  studentValue={summaryStats.score_distribution.studentValue}
                  data={summaryStats.score_distribution.data}
                  options={SCORE_HISTOGRAM_OPTIONS}
                />
              ),
            },
            {
              text: "Number of Problems Solved",
              icon: <Check />,
              component: (
                <StatisticsDashboard
                  title="Number of Problems Solved"
                  tooltip="Hover over chart for more details"
                  studentValue={
                    summaryStats.problems_solved_distribution.studentValue
                  }
                  data={summaryStats.problems_solved_distribution.data}
                  options={PROBLEMS_SOLVED_HISTOGRAM_OPTIONS}
                />
              ),
            },
            {
              text: "Number of Backups",
              icon: <Save />,
              component: (
                <StatisticsDashboard
                  title="Number of Backups"
                  tooltip="Hover over chart for more details"
                  studentValue={
                    summaryStats.number_of_backups_distribution.studentValue
                  }
                  data={summaryStats.number_of_backups_distribution.data}
                />
              ),
            },
            {
              text: "Total Time Spent",
              icon: <AccessTime />,
              tooltip:
                "Timestamp of last backup minus timestamp of first backup",
              component: (
                <StatisticsDashboard
                  title="Total Time Spent (min)"
                  tooltip="Hover over chart for more details"
                  studentValue={
                    summaryStats.total_time_spent_distribution.studentValue
                  }
                  data={summaryStats.total_time_spent_distribution.data}
                />
              ),
            },
            {
              text: "Total Active Time Spent",
              icon: <Timer />,
              tooltip:
                "Total time spent on task. To compute this, we do not count large gaps in activity.",
              component: (
                <StatisticsDashboard
                  title="Total Active Time Spent (min)"
                  tooltip="Hover over chart for more details"
                  studentValue={
                    summaryStats.active_time_spent_distribution.studentValue
                  }
                  data={summaryStats.active_time_spent_distribution.data}
                />
              ),
            },
            {
              text: "Number of Lint Errors",
              icon: <Error />,
              tooltip: "Number of lint errors in the student's final backup",
              component: (
                <StatisticsDashboard
                  title="Number of Lint Errors"
                  tooltip="Hover over chart for more details"
                  studentValue={
                    summaryStats.lint_errors_distribution.studentValue
                  }
                  data={summaryStats.lint_errors_distribution.data}
                />
              ),
            },
          ]
        : [],
    [summaryStats],
  );

  const chartsReady = backupData && fileMetadata && backupTimestamps.length > 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Typography variant="h4">Summary Statistics</Typography>
        <InfoTooltip info="Summary statistics about this student's performance on this assignment, with comparisons to other students" />
      </div>

      {menuItems.length > 0 ? (
        <Box sx={{ display: "flex", gap: 3, minHeight: "80vh" }}>
          {/* Left Sidebar */}
          <Paper
            elevation={2}
            sx={{
              width: 240,
              flexShrink: 0,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <List>
              {menuItems.map((item, index) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={activeIndex === index}
                    onClick={() => setActiveIndex(index)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />

                    <Box
                      onClick={(e) => e.stopPropagation()}
                      sx={{ ml: "auto", display: "flex", alignItems: "center" }}
                    >
                      {item.tooltip ? (
                        <InfoTooltip info={item.tooltip} />
                      ) : null}
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Main Content Area */}
          <Paper
            elevation={1}
            sx={{
              flexGrow: 1,
              p: 4,
              borderRadius: 2,
              backgroundColor: "#fafafa",
            }}
          >
            {menuItems[activeIndex].component}
          </Paper>

          <ProblemGanttPlot />
        </Box>
      ) : (
        <CircularProgress />
      )}

      {chartsReady ? (
        <>
          <LineChart
            xAxis={xAxis}
            series={[
              {
                curve: "linear",
                data: numLines,
                label: `# of lines in ${firstFile}`,
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
        </>
      ) : (
        <CircularProgress />
      )}
    </Container>
  );
}

export default SummaryTab;
