import React from "react";

import Editor from "@monaco-editor/react";

import "./FileViewer.css";

function BasicFileViewer({ code, language, lightMode, editorRef }) {


  return (
    <>
      <Editor
      onMount={(editor) => {
    editorRef.current = editor;
  }}
        defaultLanguage={language}
        defaultValue={code}
        theme={lightMode ? "light" : "vs-dark"}
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

export default BasicFileViewer;
