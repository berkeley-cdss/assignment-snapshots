import React, { useState } from "react";
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
} from "@mui/material";
import {
  AccessTime,
  Save,
  Error,
  LeaderboardSharp,
  Timer,
  Check,
} from "@mui/icons-material";

import StatisticsDashboard from "./debugging/StatisticsDashboard";
import InfoTooltip from "../../common/InfoTooltip";

// TODO: move graphs from Submission Layout into here
// TODO: lines added/removed rich git diff chart like encourse

// TODO: problem summaries [subtasks]
// TODO: duration plots for problems (see slack)
// TODO: number of backups for each problem
// TODO: plot time spent on unlocking vs correctness tests for each problem

// TODO: radar plot

function SummaryTab({}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // TOOD: highlight bucket the student is in: https://mui.com/x/react-charts/bars/?_gl=1*1qmfqpr*_up*MQ..*_ga*NTg1ODUwMzMxLjE3NzYwODczMjY.*_ga_5NXDQLC2ZK*czE3NzYwODczMjUkbzEkZzAkdDE3NzYwODczMjUkajYwJGwwJGgw#color-scale
  const menuItems = [
    {
      text: "Score",
      icon: <LeaderboardSharp />,
      component: (
        <StatisticsDashboard
          title="Score"
          tooltip="Hover over chart for more details"
          xLabels={[
            "0-10",
            "10-20",
            "20-30",
            "30-40",
            "40-50",
            "50-60",
            "60-70",
            "70-80",
            "80-90",
            "90-100",
          ]}
          studentValue={25}
          data={[5, 10, 20, 5, 20, 50, 60, 50, 90, 80]}
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
          xLabels={["0-50", "50-100", "100-200", "200-500", "500+"]}
          studentValue={25}
          data={[10, 50, 60, 80, 35]}
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
          xLabels={["0-50", "50-100", "100-200", "200-500", "500+"]}
          studentValue={25}
          data={[10, 50, 60, 80, 35]}
        />
      ),
    },
    {
      text: "Total Time Spent",
      icon: <AccessTime />,
      tooltip: "Timestamp of last backup minus timestamp of first backup",
      component: (
        <StatisticsDashboard
          title="Total Time Spent (min)"
          tooltip="Hover over chart for more details"
          xLabels={["0-10", "10-20", "20-30", "30-40", "40-50", "50+"]}
          studentValue={25}
          data={[20, 55, 80, 60, 35, 15]}
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
          xLabels={["0-10", "10-20", "20-30", "30-40", "40-50", "50+"]}
          studentValue={25}
          data={[20, 55, 80, 60, 35, 15]}
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
          xLabels={["0-50", "50-100", "100-200", "200-500", "500+"]}
          studentValue={25}
          data={[10, 50, 60, 80, 35]}
        />
      ),
    },
  ];

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

      {/* TODO: generalize this left sidebar + main area into a component */}
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
                    {item.tooltip ? <InfoTooltip info={item.tooltip} /> : null}
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
      </Box>
    </Container>
  );
}

export default SummaryTab;
