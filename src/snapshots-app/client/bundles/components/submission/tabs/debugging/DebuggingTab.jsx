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
  TrendingUp,
  Print,
  SyncProblem,
  Lightbulb,
  Dangerous,
} from "@mui/icons-material";

import AutograderSpam from "./AutograderSpam";
import PrintStatements from "./PrintStatements";
import TestRegressions from "./TestRegressions";
import PseudocodeDetection from "./PseudocodeDetection";
import Errors from "./Errors";

function DebuggingTab({}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const menuItems = [
    {
      text: "Autograder Spam",
      icon: <TrendingUp />,
      component: <AutograderSpam />,
    },
    {
      text: "Print Statements",
      icon: <Print />,
      component: <PrintStatements />,
    },
    { text: "Errors", icon: <Dangerous />, component: <Errors /> },
    // TODO(stretch): implement these pages
    // { text: 'Test Regressions', icon: <SyncProblem />, component: <TestRegressions /> },
    // { text: 'Pseudocode Detection', icon: <Lightbulb />, component: <PseudocodeDetection /> },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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

export default DebuggingTab;
