import React from "react";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { MenuItem, Select } from "@mui/material";
import { useAtom } from "jotai";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useParams } from "react-router";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Snackbar from "@mui/material/Snackbar";
import { useCopyToClipboard } from "react-use";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FormControl, InputLabel } from "@mui/material";

import FileViewer from "../components/submission/FileViewer";
import Graphs from "../components/submission/Graphs";
import Timeline from "../components/submission/Timeline";
import AutograderOutputDialog from "../components/submission/AutograderOutputDialog";
import UnlockingTestOutputDialog from "../components/submission/UnlockingTestOutputDialog";
import InfoTooltip from "../components/common/InfoTooltip";
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
  const [allProblemDisplayNames, setAllProblemDisplayNames] = React.useState(
    [],
  );

  const [code, setCode] = React.useState("");
  const [autograderOutput, setAutograderOutput] = React.useState("");

  const [lightMode, setLightMode] = React.useState(true);

  const [lintErrors, setLintErrors] = React.useState([]);
  const [filesToMetadata, setFilesToMetadata] = React.useState(null);

  const [isSnackbarOpen, setIsSnackbarOpen] = React.useState(false);
  const [state, copyToClipboard] = useCopyToClipboard();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const FILE_VIEWER_TOOLTIP_INFO =
    "View the code file(s) and OkPy output for this particular backup";

  const routeParams = useParams();

  // Fetch backups
  React.useEffect(() => {
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
        setAllProblemDisplayNames(responseData.assignment_problem_names);
      });
  }, [routeParams, setBackups]);

  // Fetch autograder output for current selected backup
  // if backups is done loading
  React.useEffect(() => {
    if (backups.length === 0 || backups[selectedBackup].unlock) {
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
  }, [backups, selectedBackup]);

  // Fetch code file contents for currently selected backup and file
  // if backups is done loading
  React.useEffect(() => {
    if (backups.length === 0 || file === "") {
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
  }, [backups, selectedBackup, file]);

  // Fetch lint errors for currently selected backup and file
  // if backups is done loading
  React.useEffect(() => {
    if (backups.length === 0 || file === "") {
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
  }, [backups, selectedBackup, file]);

  // Fetch backup file metadata for currently selected backup and file
  // if backups is done loading
  React.useEffect(() => {
    if (backups.length === 0 || file === "") {
      return;
    }

    fetch(
      `/api/backup_file_metadata/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
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
        setFilesToMetadata(responseData.files_to_metadata);
      });
  }, [routeParams, backups, selectedBackup, file]);

  const backupCreatedTimestamps = React.useMemo(() => {
    if (backups.length === 0) {
      return [];
    }

    return backups.map((backup) => backup.created);
  }, [backups]);

  function getTotalQuestionsSolved(history) {
    return history.reduce(
      (total, currQuestion) => total + (currQuestion.solved ? 1 : 0),
      0,
    );
  }

  function getTotalQuestionsUnsolved(history) {
    return history.reduce(
      (total, currQuestion) => total + (currQuestion.solved ? 0 : 1),
      0,
    );
  }

  function getTotalAttempts(history) {
    return history.reduce(
      (total, currQuestion) => total + currQuestion.attempts,
      0,
    );
  }

  const numQuestionsSolved = React.useMemo(() => {
    if (backups.length === 0) {
      return [];
    }

    return backups.map((backup) => getTotalQuestionsSolved(backup.history));
  }, [backups]);

  const numQuestionsUnsolved = React.useMemo(() => {
    if (backups.length === 0) {
      return [];
    }

    return backups.map((backup) => getTotalQuestionsUnsolved(backup.history));
  }, [backups]);

  const numAttempts = React.useMemo(() => {
    if (backups.length === 0) {
      return [];
    }

    return backups.map((backup) => getTotalAttempts(backup.history));
  }, [backups]);

  function handleBackupSelect(selectedBackupIndex) {
    setSelectedBackup(selectedBackupIndex);
    // Set these values to empty so that circular progress shows while loading new contents
    setCode("");
    setAutograderOutput("");
    setFilesToMetadata(null);
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

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setIsSnackbarOpen(false);
  };

  function getOutputButton() {
    if (backups.length !== 0) {
      // TODO not really sure why but sometimes even if a test case is unlocking type, there are no unlock messages.
      // if this is the case, don't display the "unlocking tests output" button
      if (
        backups[selectedBackup].unlock &&
        backups[selectedBackup].unlock_message_cases.length !== 0
      ) {
        return (
          <Button
            variant="contained"
            onClick={() => setIsDialogOpen(true)}
            startIcon={<VisibilityIcon />}
          >
            Unlocking Test Output
          </Button>
        );
      } else if (!backups[selectedBackup].unlock) {
        return (
          <Button
            variant="contained"
            onClick={() => setIsDialogOpen(true)}
            startIcon={<VisibilityIcon />}
          >
            Autograder Output
          </Button>
        );
      }
    }

    return null;
  }

  function getOutputDialog() {
    if (backups.length !== 0) {
      if (backups[selectedBackup].unlock) {
        return (
          <UnlockingTestOutputDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            unlockingTestCases={backups[selectedBackup].unlock_message_cases}
            questionCliNames={backups[selectedBackup].question_cli_names}
          />
        );
      } else {
        return (
          <AutograderOutputDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            autograderOutput={autograderOutput}
            questionCliNames={backups[selectedBackup].question_cli_names}
          />
        );
      }
    }

    return null;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {backups.length === 0 ? (
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
                alignItems: "flex-start",
                marginBottom: "1rem",
              }}
            >
              <div style={{ fontSize: "1.5rem" }}>
                File Viewer{" "}
                <InfoTooltip info={FILE_VIEWER_TOOLTIP_INFO} placement="top" />
              </div>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                {/* TODO diff viewer? */}

                {getOutputButton()}

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        labelId="light-mode-switch-label"
                        checked={lightMode}
                        onChange={(event) => setLightMode(event.target.checked)}
                      />
                    }
                    label={lightMode ? "Light Mode" : "Dark Mode"}
                  ></FormControlLabel>
                </FormGroup>

                <IconButton
                  color="primary"
                  size="small"
                  aria-label="copy code to clipboard"
                  onClick={copyCode}
                >
                  <ContentCopyIcon />
                </IconButton>

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
            {filesToMetadata === null || file === "" || backups.length === 0 ? (
              <CircularProgress />
            ) : (
              <Graphs
                file={file}
                backupCreatedTimestamps={backupCreatedTimestamps}
                fileMetadata={filesToMetadata[file]}
                numQuestionsSolved={numQuestionsSolved}
                numQuestionsUnsolved={numQuestionsUnsolved}
                numAttempts={numAttempts}
                currBackupHistory={backups[selectedBackup].history}
                allProblemDisplayNames={allProblemDisplayNames}
                selectedBackup={selectedBackup}
              />
            )}
          </RightSidebar>
        </ContentWrapper>
      )}

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
        message="Code copied to clipboard!"
      />

      {getOutputDialog()}
    </Box>
  );
}

export default SubmissionLayout;
