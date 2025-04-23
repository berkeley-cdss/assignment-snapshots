import React from "react";

import { Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const FixedSizeDisplayBox = styled(Paper)(({ theme }) => ({
  width: "300px",
  height: "300px",
  overflow: "auto", // Enable both horizontal and vertical scrolling
  padding: theme.spacing(1), // Add some padding for better readability
}));

function AutograderOutput({ text }) {
  return (
    <div>
      <h2>Autograder Output</h2>

      <FixedSizeDisplayBox variant="outlined">
        <Typography component="pre" style={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Typography>
      </FixedSizeDisplayBox>
    </div>
  );
}

export default AutograderOutput;
