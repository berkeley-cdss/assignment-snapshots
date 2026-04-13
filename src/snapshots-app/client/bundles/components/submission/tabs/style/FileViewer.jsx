import React, { useMemo, useEffect } from "react";

import { ButtonGroup, Button } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import Editor, { useMonaco } from "@monaco-editor/react";

import "./FileViewer.css";

// TODO deduplicate with FileViewer in submission folder
function FileViewer({ editorRef, code, language, lightMode, lintErrors }) {
  const monaco = useMonaco();
  const [editorMounted, setEditorMounted] = React.useState(false);
  const [lineIndex, setLineIndex] = React.useState(0);

  const beginProblemLines = useMemo(() => {
    const lines = [];
    for (const [lineNumber, line] of code.split("\n").entries()) {
      if (line.includes("# BEGIN Problem")) {
        lines.push(lineNumber + 1);
      }
    }
    return lines;
  }, [code]);

  useEffect(() => {
    if (!monaco || !editorRef.current) return;

    const model = editorRef.current.getModel();

    const errors = lintErrors.map((error) => ({
      code: {
        value: error.code,
        target: monaco.Uri.parse(error.url),
      },
      startLineNumber: error.start_location_row,
      startColumn: error.start_location_col,
      endLineNumber: error.end_location_row,
      endColumn: error.end_location_col,
      message: error.message,
      severity: monaco.MarkerSeverity.Error,
    }));

    monaco.editor.setModelMarkers(model, "snapshots-app", errors);
  }, [lintErrors, monaco, editorRef, editorMounted]);

  function onEditorMount(editor, monaco) {
    editorRef.current = editor;
    setEditorMounted(true);
  }

  function nextBeginProblemLine() {
    if (beginProblemLines.length === 0) return;
    const temp = lineIndex;
    // Wrap around to the beginning
    const nextIndex = (lineIndex + 1) % beginProblemLines.length;
    setLineIndex(nextIndex);
    goToLine(beginProblemLines[temp]);
  }

  function prevBeginProblemLine() {
    if (beginProblemLines.length === 0) return;
    const temp = lineIndex;
    // Wrap around to the end
    const nextIndex =
      (lineIndex - 1 + beginProblemLines.length) % beginProblemLines.length;
    setLineIndex(nextIndex);
    goToLine(beginProblemLines[temp]);
  }

  function goToLine(lineNumber) {
    if (editorRef.current) {
      // Centers the line in the viewport
      editorRef.current.revealLineInCenter(lineNumber);

      // Moves the cursor to that line
      editorRef.current.setPosition({ lineNumber: lineNumber, column: 1 });

      // Focuses the editor
      editorRef.current.focus();
    }
  }

  const jumpToNextError = () => {
    if (editorRef.current) {
      editorRef.current.trigger("snapshots-app", "editor.action.marker.next");
    }
  };

  const jumpToPrevError = () => {
    if (editorRef.current) {
      editorRef.current.trigger("snapshots-app", "editor.action.marker.prev");
    }
  };

  return (
    <>
      {/* TODO fix alignment and scroll */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <ButtonGroup>
          <Button
            size="small"
            variant="outlined"
            disabled={beginProblemLines.length === 0}
            startIcon={<ArrowUpwardIcon />}
            onClick={prevBeginProblemLine}
          >
            Previous Problem
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={beginProblemLines.length === 0}
            endIcon={<ArrowDownwardIcon />}
            onClick={nextBeginProblemLine}
          >
            Next Problem
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            size="small"
            variant="outlined"
            disabled={lintErrors.length === 0}
            startIcon={<ArrowUpwardIcon />}
            onClick={jumpToPrevError}
          >
            Previous Lint Error
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={lintErrors.length === 0}
            endIcon={<ArrowDownwardIcon />}
            onClick={jumpToNextError}
          >
            Next Lint Error
          </Button>
        </ButtonGroup>
      </div>

      <Editor
        defaultLanguage={language}
        defaultValue={code}
        theme={lightMode ? "light" : "vs-dark"}
        onMount={onEditorMount}
        options={{
          renderValidationDecorations: "on",
          domReadOnly: true,
          readOnly: true,
          renderLineHighlight: "all",
          renderWhitespace: "all",
          rulers: [80],
          scrollBeyondLastLine: false,
        }}
      />
    </>
  );
}

export default FileViewer;
