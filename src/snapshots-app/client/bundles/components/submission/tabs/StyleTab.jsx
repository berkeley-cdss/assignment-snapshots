import React, { useRef, useState, useMemo } from "react";

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

import AutograderSpam from "./debugging/AutograderSpam";
import PrintStatements from "./debugging/PrintStatements";
import TestRegressions from "./debugging/TestRegressions";
import PseudocodeDetection from "./debugging/PseudocodeDetection";
import Errors from "./debugging/Errors";
import FileViewer from "../FileViewer";

// TODO(frontend): organize imports
import useSubmissionFileData from "../hooks/useSubmissionFileData";
import { useParams } from "react-router";
import InfoTooltip from "../../common/InfoTooltip";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import CircularProgress from "@mui/material/CircularProgress";
import { useAtom } from "jotai";
import { backupsAtom } from "../../../state/atoms";

import { useCopyToClipboard } from "react-use";

import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";


import AutograderOutputDialog from "../../../components/submission/AutograderOutputDialog";
import UnlockingTestOutputDialog from "../../../components/submission/UnlockingTestOutputDialog";



function StyleTab() {
  /*
  const { courseId, assignmentId, studentId } = useParams();
  const submissionData = useSubmissionFileData({
    courseId,
    assignmentId,
    studentId,
  });
  */
 
  const courseId = 1;
  const assignmentId = 1;
  const studentId = 3;
  

  console.log(courseId, assignmentId, studentId);
  const editorRef = useRef(null);
  const [expandedCodes, setExpandedCodes] = useState(new Set()); // for accordions
  const [sortBy, setSortBy] = useState("frequency"); 
  const [filterCode, setFilterCode] = useState(null); // null = show all

  // const { courseId, assignmentId, studentId } = useParams(); 

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

  const [diffViewerOpen, setDiffViewerOpen] = React.useState(false);
  const [prevFileContents, setPrevFileContents] = React.useState("");

  

    // TODO: update eventually to correctly use params (rather than hardcoding)
    const routeParams = React.useMemo(
      () => ({ courseId: "1", assignmentId: "1", studentId: "2" }),
      [],
    );


  // TODO(frontend): abstract this to useSubmissionFileData hook
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
        setBackups(responseData.backups.toReversed());
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

  // Fetch previous backup file contents
  React.useEffect(() => {
    if (selectedBackup === 0 || backups.length === 0 || file === "") {
      return;
    }

    const queryParams = new URLSearchParams();
    queryParams.append(
      "object_key",
      `${backups[selectedBackup - 1].file_contents_location}/${file}`,
    );

    fetch(`/api/files?${queryParams}`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setPrevFileContents(responseData.file_contents);
      });
  }, [backups, selectedBackup, file]);

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
    setPrevFileContents("");
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

  

  function getLanguage(file) {
    const extension = file.split(".").pop();
    switch (extension) {
      case "py":
        return "python";
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  }


  return (
    <div style={{ display: "flex", height: "calc(100vh - 160px)", minHeight: 0 }}>
  <div style={{ width: "33%", overflowY: "auto", borderRight: "1px solid #ccc", padding: "1rem", minHeight: 0 }}>
       
  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: "2rem"}}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Lint Errors
        </Typography>
        <InfoTooltip
          info="This tab allows you to view details of different lint errors, such as details of where that lint error occured and a preview of what was on that line. Click on a lint error to jump to that position on the file viewer."
          placement="right"
        />
      </div>
        {/* sort/filter controls*/}
        <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="style-sort-label">Sort</InputLabel> 
        <Select
          labelId="style-sort-label"
          id="style-sort"
          value={sortBy}
          label="Sort by:"
          onChange={(event) => {
            setSortBy(event.target.value)
          }}
        >
          <MenuItem value={"frequency"}>Most Frequent</MenuItem>
          <MenuItem value={"code"}>Code A-Z</MenuItem>
        </Select>
      </FormControl>

      {/* TODO(frontend): group lint errors by code */}

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Lint ({lintErrors.length})
        </Typography>
        {lintErrors.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No lint issues for this file.
          </Typography>
        ) : (
          lintErrors.map((err, index) => (
            <Accordion key={`${err.code}-${err.start_location_row}-${index}`} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ pr: 1 }}>
                  Line {err.start_location_row}
                  {err.code ? ` · ${err.code}` : ""}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {err.message}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </div>

      <div
        style={{
          width: "67%",
          padding: "1rem",
          
        }}
      >
        {code === "" ? (
              <CircularProgress />
            ) : (
              <FileViewer
                code={code}
                language={getLanguage(file)}
                lightMode={lightMode}
                lintErrors={lintErrors}
                // NOTE: This is needed so that the FileViewer component
                // re-mounts after DiffViewer dialog closes, otherwise
                // error occurs because Monaco editor ref gets disposed
                // when DiffViewer dialog opens
                key={`${file}-${diffViewerOpen}`}
              />
            )}

        
      </div>
    </div>
  );
}

export default StyleTab;