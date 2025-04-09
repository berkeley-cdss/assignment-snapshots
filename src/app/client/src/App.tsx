import React from 'react';
// import logo from './logo.svg';
// import './App.css';

import { DiffView } from "@git-diff-view/react";
import { generateDiffFile } from "@git-diff-view/file";

import "@git-diff-view/react/styles/diff-view.css";

function App() {
  const data = {
    oldFile: {
      fileName: "test.py",
      content: "print('Hello world')",
      fileLang: "python",
    },
    newFile: {
      fileName: "test.py",
      content: "print('Hello Gary')",
      fileLang: "python",
    },
  }
  const file = generateDiffFile(
    data?.oldFile?.fileName || "",
    data?.oldFile?.content || "",
    data?.newFile?.fileName || "",
    data?.newFile?.content || "",
    data?.oldFile?.fileLang || "",
    data?.newFile?.fileLang || ""
  );
  file.initTheme('light');
  file.init();
  file.buildSplitDiffLines();
  file.buildUnifiedDiffLines();

  // use current data to render
  return <DiffView diffFile={file} />;
}

export default App;
