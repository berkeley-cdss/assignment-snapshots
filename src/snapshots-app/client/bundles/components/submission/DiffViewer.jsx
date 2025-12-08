import React from "react";

import { DiffView } from "@git-diff-view/react";
import { generateDiffFile } from "@git-diff-view/file";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import "@git-diff-view/react/styles/diff-view.css";

function DiffViewer({
  open,
  onClose,
  prevFileContents,
  currentFileContents,
  selectedFile,
}) {
  const diffFile = React.useMemo(() => {
    // NOTE: there is currently a bug in git-diff-view package
    // where if the current and prev file contents are equal it will error
    if (
      prevFileContents === "" ||
      currentFileContents === "" ||
      prevFileContents === currentFileContents
    ) {
      return null;
    }

    // TODO don't hardcode language
    const data = {
      oldFile: {
        fileName: selectedFile,
        content: prevFileContents,
        fileLang: "python",
      },
      newFile: {
        fileName: selectedFile,
        content: currentFileContents,
        fileLang: "python",
      },
    };

    const file = generateDiffFile(
      data?.oldFile?.fileName || "",
      data?.oldFile?.content || "",
      data?.newFile?.fileName || "",
      data?.newFile?.content || "",
      data?.oldFile?.fileLang || "",
      data?.newFile?.fileLang || "",
    );

    // TODO light/dark mode
    file.initTheme("light");
    file.init();
    file.buildSplitDiffLines();
    file.buildUnifiedDiffLines();

    return file;
  }, [selectedFile, currentFileContents, prevFileContents]);

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
        <DiffView diffFile={diffFile} />
      </DialogContent>
    </Dialog>
  );
}

export default DiffViewer;
