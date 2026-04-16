import React from "react";

import {LinearProgress} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Tooltip } from "@mui/material";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          aria-label="Upload photos"
          {...props}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function AssignmentProblems({ history, allProblemDisplayNames, numSolved }) {
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

  const problems = allProblemDisplayNames.map((problemDisplayName) => (
    <div>
      {getIcon(problemDisplayName)} {problemDisplayName}
    </div>
  ));

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
}) {
  return (
    <div>
      <div style={{ fontSize: "1.5rem" }}>
        Progress
      </div>
      <AssignmentProblems
        history={currBackupHistory}
        allProblemDisplayNames={allProblemDisplayNames}
        numSolved={numQuestionsSolved[selectedBackup]}
      />
    </div>
  );
}

export default Graphs;
