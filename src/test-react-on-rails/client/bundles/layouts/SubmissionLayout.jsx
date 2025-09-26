import React from "react";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";

import AutograderOutput from "../components/submission/AutograderOutput";
import FileViewer from "../components/submission/FileViewer";
import Graphs from "../components/submission/Graphs";
import NavBar from "../components/submission/NavBar";
import Timeline from "../components/submission/Timeline";
import { FormControl, InputLabel } from "@mui/material";

// TODO minWidth: 0 prevent main content from stretching out to sidebars, but this seems rather hacky?

const LeftSidebar = styled("aside")(({ theme }) => ({
  flex: "1.5 0 0",
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  minWidth: 0,
}));

const MainContent = styled("main")(({ theme }) => ({
  flex: "5 0 0",
  padding: theme.spacing(3),
  minWidth: 0,
}));

const RightSidebar = styled("aside")(({ theme }) => ({
  flex: "2 0 0",
  borderLeft: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  minWidth: 0,
}));

const ContentWrapper = styled(Box)({
  display: "flex",
  flexGrow: 1,
});

// TODO don't hardcode values and instead fetch from server
// TODO add dropdown to be able to switch to different files in this submission

// TODO picked a random person below
const FILE_PATH_PREFIX = "cal-cs88-sp25/maps/0a2cf5f9/2O8r4J";

function SubmissionLayout() {
  const initialFile = "utils.py";
  const [file, setFile] = React.useState(initialFile);
  const [code, setCode] = React.useState("");
  const [autograderOutput, setAutograderOutput] = React.useState("");

  // TODO create fetch file helper function - move out of this file?

  // Fetch autograder output
  React.useEffect(() => {
    fetch(`/files/${FILE_PATH_PREFIX}/autograder_output.txt`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        setAutograderOutput(responseData["file_contents"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, []);

  // Fetch the initial file
  React.useEffect(() => {
    fetch(`/files/${FILE_PATH_PREFIX}/${initialFile}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        setCode(responseData["file_contents"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, []);

  // Fetch new file when selected
  const handleChange = (event) => {
    setFile(event.target.value);

    fetch(`/files/${FILE_PATH_PREFIX}/${event.target.value}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        setCode(responseData["file_contents"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* TODO display student stuff somehow */}
      {/* <AppBar position="static">
        <Toolbar>
          <NavBar
            studentName="Rebecca Dang"
            studentEmail="rdang@berkeley.edu"
            studentId={3037279631}
            assignmentName="Maps"
          />
        </Toolbar>
      </AppBar>
      */}
      <ContentWrapper>
        <LeftSidebar>
          {/* Left Sidebar Content Area */}
          <Timeline />
        </LeftSidebar>
        {/* TODO make width more responsive */}
        <MainContent>
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

export default SubmissionLayout;
