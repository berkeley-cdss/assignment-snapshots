import React from "react";

import { Typography, Paper, Link } from "@mui/material";
import { CodeBlock } from "react-code-block"; // TODO uninstall react-code-blocks?
import { themes } from 'prism-react-renderer';
import Tooltip from "@mui/material/Tooltip";
import IconButton from '@mui/material/IconButton';
import ErrorIcon from '@mui/icons-material/Error';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import './FileViewer.css';

function FileViewer({ code, language, lightMode, lintErrors }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedLintError, setSelectedLintError] = React.useState(null);
  const lines = lintErrors.map((error) => error.line_number);
  console.log('file viewer lint errors and lines:', lintErrors, lines);

  function handleClickLintError(lineNumber) {
    const error = lintErrors.find((error) => error.line_number === lineNumber);
    setSelectedLintError(error);
    setIsDialogOpen(true);
  }

  return (
    <div>
    <Paper elevation={3} sx={{ padding: 2, borderRadius: 1 }}>
      <Typography
        variant="body2"
        component="pre"
        style={{ margin: 0, whiteSpace: "pre-wrap" }}
      >
        <div
          style={{
            fontFamily: "Menlo",
          }}
        >
          <CodeBlock
            code={code}
            language={language}
            theme={lightMode ? themes.github : themes.vsDark} // TODO switch based on lightMode... why aren't themes working? themes.vsDark and themes.vsLight
            lines={lines}
            style={{ display: "table" }}
          >
            {/* TODO need to manually change bg color too based on lightMode */}
            <CodeBlock.Code style={{ backgroundColor: lightMode ? "white" : "#1e1e1e" }}>
              {({ isLineHighlighted, lineNumber }) => (
                <div style={{ display: "table-row", backgroundColor: isLineHighlighted ? 'rgba(255, 0, 0, 0.2)' : 'transparent', overflowX: 'auto' }}>
                  <div style={{ display: "table-cell", paddingRight: 5 }}>
                    {isLineHighlighted ? (
                      <Tooltip title="Click to view lint error">
                      <IconButton aria-label="view lint error for this line" size="small" color="error" onClick={() => handleClickLintError(lineNumber)}>
                        <ErrorIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    ) : null}
                  </div>
                  <CodeBlock.LineNumber className="noselect" style={{ display: "table-cell", color: lightMode ? "black" : "white", paddingRight: 10 }} />
                  <CodeBlock.LineContent style={{ display: "table-cell" }}>
                    <CodeBlock.Token />
                  </CodeBlock.LineContent>

                </div>
              )}
            </CodeBlock.Code>
          </CodeBlock>
        </div>
      </Typography>
    </Paper>

    <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        aria-labelledby="alert-dialog-title" // TODO fix these?
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {selectedLintError !== null ? `Lint error on line ${selectedLintError.line_number}` : ''}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {selectedLintError !== null ? <div>
              <div style={{ fontFamily: 'Menlo' }}>{selectedLintError.code}: {selectedLintError.message}</div>
              <div><Link href={selectedLintError.url} target="_blank" rel="noreferrer">Learn more</Link></div>
            </div> : ''}
          </DialogContentText>
        </DialogContent>
      </Dialog>
      </div>
  );
}

export default FileViewer;
