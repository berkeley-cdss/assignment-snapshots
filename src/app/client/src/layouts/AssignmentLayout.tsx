import React from 'react';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';

import AutograderOutput from '../components/AutograderOutput';
import FileViewer from '../components/FileViewer';
import Graphs from '../components/Graphs';
import NavBar from '../components/NavBar';
import Timeline from '../components/Timeline';

const leftSidebarWidth = 240;
const rightSidebarWidth = 300;

const LeftSidebar = styled('aside')(({ theme }) => ({
  width: leftSidebarWidth,
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const RightSidebar = styled('aside')(({ theme }) => ({
  width: rightSidebarWidth,
  borderLeft: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const ContentWrapper = styled(Box)({
  display: 'flex',
  flexGrow: 1,
});

function AssignmentLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {/* Top Navigation Area */}
          <NavBar />
        </Toolbar>
      </AppBar>
      <ContentWrapper>
        <LeftSidebar>
          {/* Left Sidebar Content Area */}
          <Timeline />
        </LeftSidebar>
        <MainContent>
          {/* Main Content Area */}
          <FileViewer />
          <Toolbar /> {/* Spacer to offset content below AppBar */}
        </MainContent>
        <RightSidebar sx={{ display: { xs: 'none', sm: 'block' } }}>
          {/* Right Sidebar Content Area */}
          <AutograderOutput />
          <Graphs />
        </RightSidebar>
      </ContentWrapper>
    </Box>
  );
}

export default AssignmentLayout;
