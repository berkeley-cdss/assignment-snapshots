import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Typography } from "@mui/material";

function AutograderOutputDialog({ open, onClose, autograderOutput }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="autogdrader-output-dialog-title"
      aria-describedby="autograder-output-dialog-description"
    >
      <DialogTitle id="autograder-output-dialog-title">
        Autograder Output
      </DialogTitle>
      <DialogContent>
        <Typography
          id="autograder-output-dialog-description"
          component="pre"
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "Menlo",
            fontSize: "0.8rem",
          }}
        >
          {autograderOutput}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

export default AutograderOutputDialog;
