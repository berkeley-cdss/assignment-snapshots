import React from "react";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { MenuItem, Select } from "@mui/material";
import { useAtom } from "jotai";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useParams } from "react-router";
import Fab from '@mui/material/Fab';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Snackbar from '@mui/material/Snackbar';
import { useCopyToClipboard } from 'react-use';

import AutograderOutput from "../components/submission/AutograderOutput";
import FileViewer from "../components/submission/FileViewer";
import Graphs from "../components/submission/Graphs";
import Timeline from "../components/submission/Timeline";
import { FormControl, InputLabel } from "@mui/material";
import { backupsAtom } from "../state/atoms";

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

function SubmissionLayout() {
  const [backups, setBackups] = useAtom(backupsAtom);
  const [selectedBackup, setSelectedBackup] = React.useState(0);
  const [files, setFiles] = React.useState([]);
  const [file, setFile] = React.useState("");
  const [loadingBackups, setLoadingBackups] = React.useState(false);

  const [code, setCode] = React.useState("");
  const [autograderOutput, setAutograderOutput] = React.useState("");

  const [lightMode, setLightMode] = React.useState(true);

  const [lintErrors, setLintErrors] = React.useState([]);

  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const [state, copyToClipboard] = useCopyToClipboard();

  const routeParams = useParams();

  // Fetch backups
  React.useEffect(() => {
    setLoadingBackups(true);
    fetch(
      `/api/backups/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
      {
        method: "GET",
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setBackups(responseData.backups);
        setSelectedBackup(0);
        setFiles(responseData.assignment_file_names);
        setFile(responseData.assignment_file_names[0]);
        setLoadingBackups(false);
      });
  }, [routeParams, setBackups]);

  // Fetch autograder output for current selected backup
  // if backups is done loading
  React.useEffect(() => {
    if (loadingBackups || backups.length === 0) {
      return;
    }

    const autograderQueryParams = new URLSearchParams();
    autograderQueryParams.append(
      "object_key",
      backups[selectedBackup].autograder_output_location,
    );

    fetch(`/api/files?${autograderQueryParams}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setAutograderOutput(responseData.file_contents);
      });
  }, [loadingBackups, backups, selectedBackup]);

  // Fetch code file contents for currently selected backup and file
  // if backups is done loading
  React.useEffect(() => {
    if (loadingBackups || backups.length === 0 || file === "") {
      return;
    }

    const codeQueryParams = new URLSearchParams();
    codeQueryParams.append(
      "object_key",
      `${backups[selectedBackup].file_contents_location}/${file}`,
    );

    fetch(`/api/files?${codeQueryParams}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setCode(responseData.file_contents);
      });
  }, [loadingBackups, backups, selectedBackup, file]);

  // Fetch lint errors for currently selected backup and file
  // if backups is done loading
  React.useEffect(() => {
    if (loadingBackups || backups.length === 0 || file === "") {
      return;
    }

    const lintErrorsQueryParams = new URLSearchParams();
    lintErrorsQueryParams.append(
      "file_contents_location",
      `${backups[selectedBackup].file_contents_location}/${file}`,
    );

    fetch(`/api/lint_errors?${lintErrorsQueryParams}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setLintErrors(responseData.lint_errors);
      });
  }, [loadingBackups, backups, selectedBackup, file]);

  function handleBackupSelect(selectedBackupIndex) {
    setSelectedBackup(selectedBackupIndex);
    // Set these values to empty so that circular progress shows while loading new contents
    setCode("");
    setAutograderOutput("");
  }

  function getLanguage(file) {
    const extension = file.split(".").pop();
    switch (extension) {
      case "py":
        return "python";
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  }

  const copyCode = () => {
    // Logic to copy `code`
    copyToClipboard(code);
    setIsSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    event,
    reason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsSnackbarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {loadingBackups ? (
        <CircularProgress />
      ) : (
        <ContentWrapper>
          <LeftSidebar>
            {/* Left Sidebar Content Area */}
            <Timeline
              backups={backups}
              selectedBackup={selectedBackup}
              handleBackupSelect={handleBackupSelect}
            />
          </LeftSidebar>
          {/* TODO make width more responsive */}
          <MainContent>
            {/* Main Content Area */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2>File Viewer</h2>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {/* TODO diff viewer? */}
                <FormGroup>
                  <FormControlLabel control={<Switch
                    labelId="light-mode-switch-label"
                    checked={lightMode}
                    onChange={(event) => setLightMode(event.target.checked)}
                  />} label={lightMode ? "Light Mode" : "Dark Mode"}>
                  </FormControlLabel>
                </FormGroup>
                <Fab color="primary" size="small" aria-label="copy code to clipboard" onClick={copyCode} >
                        <ContentCopyIcon />
                      </Fab>
                <FormControl>
                  <InputLabel id="file-select-label">File</InputLabel>
                  <Select
                    labelId="file-select-label"
                    id="file-select"
                    value={file}
                    label="File"
                    onChange={(event) => {
                      setFile(event.target.value);
                      setCode("");
                    }}
                  >
                    {files.map((file) => (
                      <MenuItem value={file}>{file}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            {code === "" ? (
              <CircularProgress />
            ) : (
              <FileViewer
                code={code}
                language={getLanguage(file)}
                lightMode={lightMode}
                lintErrors={lintErrors}
              />
            )}

            <Toolbar />
          </MainContent>
          <RightSidebar sx={{ display: { xs: "none", sm: "block" } }}>
            {/* Right Sidebar Content Area */}
            {autograderOutput === "" ? (
              <CircularProgress />
            ) : (
              <AutograderOutput text={autograderOutput} />
            )}
            <Graphs />
          </RightSidebar>
        </ContentWrapper>
      )}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
        message="Code copied to clipboard!"
      />
    </Box>
  );
}

export default SubmissionLayout;
