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
  Paper
} from '@mui/material';
import {
  TrendingUp,
  Print,
  Error,
  SyncProblem,
  Lightbulb,
  Dangerous,
} from '@mui/icons-material';

const AutograderSpam = () => <Typography variant="h4">Autograder Spam</Typography>;
const PrintStatements = () => <Typography variant="h4">Print Statements</Typography>;
const TestFailures = () => <Typography variant="h4">Test Failures</Typography>;
const TestRegressions = () => <Typography variant="h4">Test Regressions</Typography>;
const PseudocodeDetection = () => <Typography variant="h4">Pseudocode Detection</Typography>;
const Errors = () => <Typography variant="h4">Errors</Typography>;

function DebuggingTab({}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const menuItems = [
    { text: 'Autograder Spam', icon: <TrendingUp />, component: <AutograderSpam /> },
    { text: 'Print Statements', icon: <Print />, component: <PrintStatements /> },
    { text: 'Test Failures', icon: <Error />, component: <TestFailures /> },
    { text: 'Test Regressions', icon: <SyncProblem />, component: <TestRegressions /> },
    { text: 'Pseudocode Detection', icon: <Lightbulb />, component: <PseudocodeDetection /> },
    { text: 'Errors', icon: <Dangerous />, component: <Errors /> },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 3, minHeight: '80vh' }}>

        {/* Left Sidebar */}
        <Paper
          elevation={2}
          sx={{
            width: 240,
            flexShrink: 0,
            borderRadius: 2,
            overflow: 'hidden'
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
            backgroundColor: '#fafafa'
          }}
        >
          {menuItems[activeIndex].component}
          <Box sx={{ mt: 2 }}>
            <Typography color="text.secondary">
              This is the main display area for {menuItems[activeIndex].text}.
            </Typography>
          </Box>
        </Paper>

      </Box>
    </Container>
  );
};

export default DebuggingTab;
