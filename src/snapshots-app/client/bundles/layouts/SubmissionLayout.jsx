import React, { useMemo } from "react";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useAtom } from "jotai";

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

// TODO don't hardcode values and instead fetch from server
// TODO add dropdown to be able to switch to different files in this submission

// TODO picked a random person below
// const FILE_PATH_PREFIX = "cal-cs88-sp25/maps/0a2cf5f9/2O8r4J";

// TODO how to generalize this
const assignmentToFiles = {
  "maps": ["utils.py", "abstractions.py", "recommend.py"],
  "lab00": ["lab00.py"],
};

function SubmissionLayout() {
  const [selectedCourse, setSelectedCourse] = useAtom(selectedCourseAtom);
  const [selectedAssignment, setSelectedAssignment] = useAtom(selectedAssignmentAtom);
  const [selectedStudent, setSelectedStudent] = useAtom(selectedStudentAtom);
  const [backups, setBackups] = useAtom(backupsAtom); // TODO: pass backups to timeline
  const [selectedBackup, setSelectedBackup] = useAtom(selectedBackupAtom);

  console.log("selected assignment", selectedAssignment);

  const files = useMemo(() => assignmentToFiles[selectedAssignment.okpy_endpoint], [selectedAssignment]);

  const [file, setFile] = React.useState(files[0]);
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
        setBackups(responseData["backups"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, [selectedCourse, selectedAssignment, selectedStudent, setBackups]);

  const filePathPrefix = useMemo(() => {
    if (backups.length > 0) {
      const transformedOkpyEndpoint = selectedCourse.okpy_endpoint.replaceAll('/', '-');
      const backupId = backups[selectedBackup].backup_id; // TODO fix error - backups has not been fetched yet since useEffect happens after
      return `${transformedOkpyEndpoint}/${selectedAssignment.okpy_endpoint}/${selectedStudent.email}/${backupId}`
    }
  }, [selectedCourse, selectedAssignment, selectedStudent, backups, selectedBackup]);

  // Fetch autograder output
  React.useEffect(() => {
    fetch(`/api/files/${filePathPrefix}/autograder_output.txt`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setAutograderOutput(responseData["file_contents"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, [filePathPrefix]);

  // Fetch the initial file
  React.useEffect(() => {
    fetch(`/api/files/${filePathPrefix}/${file}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setCode(responseData["file_contents"]);
      })
      .catch((error) => {
        throw new Error(`HTTP error! Error: ${error}`);
      });
  }, [filePathPrefix, file]);

  // Fetch new file when selected
  const handleChange = (event) => {
    setFile(event.target.value);

    // fetch(`/api/files/${filePathPrefix}/${event.target.value}`, {
    //   method: "GET",
    // })
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! Status: ${response.status}`);
    //     }
    //     return response.json();
    //   })
    //   .then((responseData) => {
    //     console.log(responseData);
    //     setCode(responseData["file_contents"]);
    //   })
    //   .catch((error) => {
    //     throw new Error(`HTTP error! Error: ${error}`);
    //   });
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
    </Box>
  );
}

export default SubmissionLayout;
