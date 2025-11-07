import React, { useMemo } from "react";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useAtom } from "jotai";
import CircularProgress from '@mui/material/CircularProgress';

import AutograderOutput from "../components/submission/AutograderOutput";
import FileViewer from "../components/submission/FileViewer";
import Graphs from "../components/submission/Graphs";
import NavBar from "../components/submission/NavBar";
import Timeline from "../components/submission/Timeline";
import { FormControl, InputLabel } from "@mui/material";
import { selectedCourseAtom, selectedAssignmentAtom, selectedStudentAtom, backupsAtom, selectedBackupAtom } from "../state/atoms";

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

// TODO add dropdown to be able to switch to different files in this submission



function SubmissionLayout() {
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedAssignment, setSelectedAssignment] = useAtom(selectedAssignmentAtom);
  const [selectedStudent, setSelectedStudent] = useAtom(selectedStudentAtom);
  const [backups, setBackups] = useAtom(backupsAtom); // TODO: pass backups to timeline
  const [selectedBackup, setSelectedBackup] = useAtom(selectedBackupAtom);

  const [files, setFiles] = React.useState([]);
  const [file, setFile] = React.useState("");
  const [code, setCode] = React.useState("");
  const [autograderOutput, setAutograderOutput] = React.useState("");

  // Fetch backups
  React.useEffect(() => {
    fetch(`/api/backups/${selectedCourse.id}/${selectedAssignment.id}/${selectedStudent.id}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        const fetchedBackups = responseData["backups"];
        setBackups(fetchedBackups);
        // TODO: use derived atoms? file index?
        setFiles(fetchedBackups[selectedBackup]["files"].map((file) => file.name));
        setFile(fetchedBackups[selectedBackup]["files"][0].name);
        setCode(fetchedBackups[selectedBackup]["files"][0].contents);
        setAutograderOutput(fetchedBackups[selectedBackup]["autograder_output"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, [selectedCourse, selectedAssignment, selectedStudent, setBackups, selectedBackup, setFiles, setFile, setCode, setAutograderOutput]);


  // Fetch new file when selected
  const handleChange = (event) => {
    setFile(event.target.value);
    // TODO: use derived atoms? file index?
    const fileObjects = backups[selectedBackup]["files"];
    const selectedFileObj = fileObjects.find((fileObj) => fileObj.name === event.target.value);
    setCode(selectedFileObj.contents);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {backups.length === 0 ?
        <CircularProgress /> :
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
                {files.map((file) => <MenuItem value={file}>{file}</MenuItem>)}
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
      }

    </Box>
  );
}

export default SubmissionLayout;
