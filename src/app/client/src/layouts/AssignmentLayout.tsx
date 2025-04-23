import React from "react";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";

import AutograderOutput from "../components/AutograderOutput";
import FileViewer from "../components/FileViewer";
import Graphs from "../components/Graphs";
import NavBar from "../components/NavBar";
import Timeline from "../components/Timeline";
import {
  data_processor,
  web_scraper,
  game_logic,
  autograder_output,
} from "./constants.ts";
import { FormControl, InputLabel } from "@mui/material";

const leftSidebarWidth = 240;
const rightSidebarWidth = 300;

const LeftSidebar = styled("aside")(({ theme }) => ({
  width: leftSidebarWidth,
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const MainContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const RightSidebar = styled("aside")(({ theme }) => ({
  width: rightSidebarWidth,
  borderLeft: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

const ContentWrapper = styled(Box)({
  display: "flex",
  flexGrow: 1,
});

// TODO don't hardcode values and instead fetch from server
// TODO add dropdown to be able to switch to different files in this submission

function AssignmentLayout() {
  const [file, setFile] = React.useState("data_processor.py");
  const [code, setCode] = React.useState(data_processor);

  const handleChange = (event: SelectChangeEvent) => {
    setFile(event.target.value as string);
    if (event.target.value === "data_processor.py") {
      setCode(data_processor);
    } else if (event.target.value === "web_scraper.py") {
      setCode(web_scraper);
    } else {
      setCode(game_logic);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          {/* Top Navigation Area */}
          <NavBar
            studentName="Rebecca Dang"
            studentEmail="rdang@berkeley.edu"
            studentId={3037279631}
            assignmentName="Maps"
          />
        </Toolbar>
      </AppBar>
      <ContentWrapper>
        <LeftSidebar>
          {/* Left Sidebar Content Area */}
          <Timeline />
        </LeftSidebar>
        {/* TODO make width more responsive */}
        <MainContent style={{ width: "300px" }}>
          {/* Main Content Area */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>File Viewer</h2>
            <FormControl>
              <InputLabel id="demo-simple-select-label">File</InputLabel>
              <Select
                // TODO fix labelId and id
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={file}
                label="File"
                onChange={handleChange}
              >
                <MenuItem value="data_processor.py">data_processor.py</MenuItem>
                <MenuItem value="web_scraper.py">web_scraper.py</MenuItem>
                <MenuItem value="game_logic.py">game_logic.py</MenuItem>
              </Select>
            </FormControl>
          </div>
          <FileViewer code={code} language="python" />
          <Toolbar /> {/* Spacer to offset content below AppBar */}
        </MainContent>
        <RightSidebar sx={{ display: { xs: "none", sm: "block" } }}>
          {/* Right Sidebar Content Area */}
          <AutograderOutput text={autograder_output} />
          <Graphs />
        </RightSidebar>
      </ContentWrapper>
    </Box>
  );
}

export default AssignmentLayout;
