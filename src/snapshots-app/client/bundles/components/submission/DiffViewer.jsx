import React, { useRef } from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { ButtonGroup, Button } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import { DiffEditor } from "@monaco-editor/react";

// TODO uninstall git-diff-view once this is removed
// TODO I have been accidentally relying on this import for styling the entire website
import "@git-diff-view/react/styles/diff-view.css";

function DiffViewer({ open, onClose, prevFileContents, currentFileContents }) {
  const editorRef = useRef(null);

  const onDiffEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // once diff is computed, jump to the first diff
    editor.onDidUpdateDiff(() => {
      editorRef.current.goToDiff("next");
    });
  };

  const goToNextDiff = () => {
    editorRef.current.goToDiff("next");
  };

  const goToPreviousDiff = () => {
    editorRef.current.goToDiff("previous");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="diff-viewer-dialog-title"
      aria-describedby="diff-viewer-dialog-description"
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle id="diff-viewer-dialog-title">Diff Viewer</DialogTitle>
      <DialogContent>
        <ButtonGroup
          sx={{
            marginBottom: "1rem",
          }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowUpwardIcon />}
            onClick={goToPreviousDiff}
          >
            Previous Change
          </Button>
          <Button
            size="small"
            variant="outlined"
            endIcon={<ArrowDownwardIcon />}
            onClick={goToNextDiff}
          >
            Next Change
          </Button>
        </ButtonGroup>
        <DiffEditor
          height="100vh"
          original={prevFileContents}
          modified={currentFileContents}
          language="python"
          onMount={onDiffEditorMount}
          // https://github.com/suren-atoyan/monaco-react/issues/647#issuecomment-2897027817
          keepCurrentOriginalModel={true}
          keepCurrentModifiedModel={true}
          options={{
            readOnly: true,
            domReadOnly: true,
            renderLineHighlight: "all",
            renderWhitespace: "all",
            rulers: [80],
            scrollBeyondLastLine: false,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default DiffViewer;
