import React from "react";

import { LinearProgress } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Tooltip } from "@mui/material";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link } from "@mui/material";
import { List, ListItem } from "@mui/material";

// TODO jump to EC problems

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          aria-label="Upload photos"
          {...props}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary" }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const ProblemJumpLink = ({ lineNumber, editorRef, label }) => {
  const handleJump = (event) => {
    // Prevent default link behavior if necessary
    event.preventDefault();

    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    const targetEditor = editorInstance.getModifiedEditor
      ? editorInstance.getModifiedEditor()
      : editorInstance;

    targetEditor.revealLineInCenter(lineNumber);
    targetEditor.setPosition({ lineNumber: lineNumber, column: 1 });
    targetEditor.focus();
  };

  return (
    <Link
      component="button"
      variant="body2"
      onClick={handleJump}
      sx={{
        textAlign: "left",
        verticalAlign: "baseline",
        textDecoration: "none",
        "&:hover": {
          textDecoration: "underline",
        },
        cursor: "pointer",
        color: "primary.main",
        fontWeight: 500,
      }}
    >
      {label || `Line ${lineNumber}`}
    </Link>
  );
};

function AssignmentProblems({
  history,
  allProblemDisplayNames,
  numSolved,
  editorRef,
  problemLines,
}) {
  function goToLine(lineNumber) {
    const editor = editorRef.current;
    if (!editor) return;

    // 1. Check if it's a Diff Editor (has getModifiedEditor method)
    // 2. Otherwise treat as a standard editor
    const targetEditor = editor.getModifiedEditor
      ? editor.getModifiedEditor()
      : editor;

    targetEditor.revealLineInCenter(lineNumber);
    targetEditor.setPosition({ lineNumber: lineNumber, column: 1 });
    targetEditor.focus();
  }

  function getIcon(problemDisplayName) {
    const problemData = history.find(
      (p) => p.display_name === problemDisplayName,
    );
    if (problemData !== undefined && problemData.solved) {
      return (
        <Tooltip title="Solved" placement="left">
          <DoneIcon color="success" />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Unsolved" placement="left">
          <ErrorOutlineIcon color="error" />
        </Tooltip>
      );
    }
  }

  function getPercentSolved() {
    return (numSolved / allProblemDisplayNames.length) * 100;
  }

  // TODO span styling and improve accessibility?
  const problems = allProblemDisplayNames.map((problemDisplayName) => {
    const lines = problemLines[problemDisplayName];

    if (problemLines[problemDisplayName].length === 0) {
      return (
        <Box
          key={problemDisplayName}
          sx={{ display: "flex", alignItems: "center", my: 0.5 }}
        >
          {getIcon(problemDisplayName)}
          <Typography variant="body2" sx={{ ml: 1, color: "text.disabled" }}>
            {problemDisplayName} (Not found)
          </Typography>
        </Box>
      );
    } else if (problemLines[problemDisplayName].length === 1) {
      return (
        <Box
          key={problemDisplayName}
          sx={{ display: "flex", alignItems: "center", my: 0.5 }}
        >
          {getIcon(problemDisplayName)}
          <Box sx={{ ml: 1 }}>
            <ProblemJumpLink
              lineNumber={lines[0]}
              editorRef={editorRef}
              label={problemDisplayName}
            />
          </Box>
        </Box>
      );
    } else {
      return (
        <Box key={problemDisplayName} sx={{ my: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {getIcon(problemDisplayName)}
            <Typography variant="body2" sx={{ ml: 1 }}>
              {problemDisplayName}
            </Typography>
          </Box>
          <Box
            sx={{
              pl: 4,
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
            }}
          >
            <List sx={{ listStyleType: "disc", pl: "1rem" }}>
              {lines.map((lineNumber) => (
                <ListItem disablePadding sx={{ display: "list-item" }}>
                  <ProblemJumpLink
                    key={`${problemDisplayName}-${lineNumber}`}
                    lineNumber={lineNumber}
                    editorRef={editorRef}
                    label={`Line ${lineNumber}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      );
    }
  });

  return (
    <div style={{ paddingTop: "1rem", paddingBottom: "1rem" }}>
      <LinearProgressWithLabel value={Math.round(getPercentSolved())} />
      <div>{problems}</div>
    </div>
  );
}

// TODO rename for consistency with UI
function Graphs({
  numQuestionsSolved,
  currBackupHistory,
  allProblemDisplayNames,
  selectedBackup,
  problemLines,
  editorRef,
}) {
  return (
    <div>
      <div style={{ fontSize: "1.5rem" }}>Progress</div>
      <AssignmentProblems
        history={currBackupHistory}
        allProblemDisplayNames={allProblemDisplayNames}
        numSolved={numQuestionsSolved[selectedBackup]}
        problemLines={problemLines}
        editorRef={editorRef}
      />
    </div>
  );
}

export default Graphs;
