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
import { AccessTime, Save, Error, LeaderboardSharp } from "@mui/icons-material";
import { BarChart } from "@mui/x-charts/BarChart";
import InfoTooltip from "../../common/InfoTooltip";

const Histogram = ({ title, tooltip, xLabels, data }) => (
  <Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="h6">{title}</Typography>
      <InfoTooltip info={tooltip} />
    </Box>
    <BarChart
      xAxis={[{ scaleType: "band", data: xLabels }]}
      leftAxis={null}
      series={[{ data }]}
      height={300}
    />
  </Box>
);

function SummaryTab({}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const menuItems = [
    {
      text: "Time Taken",
      icon: <AccessTime />,
      tooltip: "How long it took to complete the assignment",
      component: (
        <Histogram
          title="Time Taken (min)"
          tooltip="Hover over chart for more details"
          xLabels={["0-10m", "10-20m", "20-30m", "30-40m", "40-50m", "50m+"]}
          data={[20, 55, 80, 60, 35, 15]}
        />
      ),
    },
    {
      text: "Number of Backups",
      icon: <Save />,
      tooltip: "Number of backups compared to other students",
      component: (
        <Histogram
          title="Number of Backups"
          tooltip="Hover over chart for more details"
          xLabels={["0-50", "50-100", "100-200", "200-500", "500+"]}
          data={[10, 50, 60, 80, 35]}
        />
      ),
    },
    {
      text: "Comparative Score",
      icon: <LeaderboardSharp />,
      tooltip: "Score on assignment compared to other students",
      component: (
        <Histogram
          title="Score Distribution (%)"
          tooltip="Hover over chart for more details"
          xLabels={[
            "0-10%",
            "10-20%",
            "20-30%",
            "30-40%",
            "40-50%",
            "50-60%",
            "60-70%",
            "70-80%",
            "80-90%",
            "90-100%",
          ]}
          data={[5, 10, 20, 5, 20, 50, 60, 50, 90, 80]}
        />
      ),
    },
    {
      text: "Common Errors",
      icon: <Error />,
      tooltip: "Most common errors for this student",
      component: (
        <Histogram
          title="Common Errors"
          tooltip="Hover over chart for more details"
          xLabels={["I was not sure what to put for this"]}
          data={[67]}
        />
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Summary Stats
      </Typography>
      <Typography variant="h6" gutterBottom>
        Select a stat to learn more.
      </Typography>
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
                    <InfoTooltip info={item.tooltip} />
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
