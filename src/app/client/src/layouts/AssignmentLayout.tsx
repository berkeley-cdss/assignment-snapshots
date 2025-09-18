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

// TODO picked a random person below
const FILE_PATH_PREFIX = "cal-cs88-sp25/maps/0a2cf5f9/2O8r4J";

function AssignmentLayout() {
  const initialFile = "utils.py";
  const [file, setFile] = React.useState(initialFile);
  const [code, setCode] = React.useState("");
  const [autograderOutput, setAutograderOutput] = React.useState("");

  // TODO create fetch file helper function - move out of this file?

  // Fetch autograder output
  React.useEffect(() => {
    fetch(`/files/${FILE_PATH_PREFIX}/autograder_output.txt`, {
      method: 'GET',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(responseData => {
      console.log(responseData);
      setAutograderOutput(responseData["file_contents"]);
    })
    .catch(error => {
      throw new Error(`HTTP error! Error: ${error}`);
    });
  }, []);

  // Fetch the initial file
  React.useEffect(() => {
    fetch(`/files/${FILE_PATH_PREFIX}/${initialFile}`, {
      method: 'GET',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(responseData => {
      console.log(responseData);
      setCode(responseData["file_contents"]);
    })
    .catch(error => {
      throw new Error(`HTTP error! Error: ${error}`);
    });
  }, []);

  // Fetch new file when selected
  const handleChange = (event: SelectChangeEvent) => {
    setFile(event.target.value as string);

    fetch(`/files/${FILE_PATH_PREFIX}/${event.target.value as string}`, {
      method: 'GET',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(responseData => {
      console.log(responseData);
      setCode(responseData["file_contents"]);
    })
    .catch(error => {
      throw new Error(`HTTP error! Error: ${error}`);
    });
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
                <MenuItem value="utils.py">utils.py</MenuItem>
                <MenuItem value="abstractions.py">abstractions.py</MenuItem>
                <MenuItem value="recommend.py">recommend.py</MenuItem>
              </Select>
            </FormControl>
          </div>
          <FileViewer code={code} language="python" />
          <Toolbar /> {/* Spacer to offset content below AppBar */}
        </MainContent>
        <RightSidebar sx={{ display: { xs: "none", sm: "block" } }}>
          {/* Right Sidebar Content Area */}
          <AutograderOutput text={autograderOutput} />
          <Graphs />
        </RightSidebar>
      </ContentWrapper>
    </Box>
  );
}

export default AssignmentLayout;
