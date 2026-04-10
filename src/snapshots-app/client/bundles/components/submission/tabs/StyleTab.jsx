import React, { useRef, useState, useMemo } from "react";

import {
  Box,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
} from "@mui/material";
import {
  TrendingUp,
  Print,
  SyncProblem,
  Lightbulb,
  Dangerous,
} from "@mui/icons-material";

import AutograderSpam from "./debugging/AutograderSpam";
import PrintStatements from "./debugging/PrintStatements";
import TestRegressions from "./debugging/TestRegressions";
import PseudocodeDetection from "./debugging/PseudocodeDetection";
import Errors from "./debugging/Errors";
import FileViewer from "../FileViewer";


import useSubmissionFileData from "../hooks/useSubmissionFileData";
import { useParams } from "react-router";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";



function StyleTab({  language, lightMode }) {

  



  const editorRef = useRef(null);
  const [expandedCodes, setExpandedCodes] = useState(new Set()); // for accordions
  const [sortBy, setSortBy] = useState("frequency"); 
  const [filterCode, setFilterCode] = useState(null); // null = show all

  const { courseId, assignmentId, studentId } = useParams(); 

  const {
    files,
    file,
    setFile,
    code,
    lintErrors,
    loadingBackups,
    error,
  } = useSubmissionFileData({ courseId, assignmentId, studentId });

  function getLanguage(file) {
    if (!file || !file.includes(".")) return "python"; // temporary fallback
    const extension = file.split(".").pop();
    if (extension === "py") return "python";
    return "python"; // or throw with better context
  }


  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* left sidebar */}
      
      <div style={{ width: "33%", overflowY: "auto", borderRight: "1px solid #ccc", padding: "1rem" }}>
        {/* sort/filter controls placeholder */}
        <FormControl>
        <InputLabel id="style-sort-label">Sort</InputLabel> 
        <Select
          labelId="style-sort-label"
          id="style-sort"
          value={sortBy}
          label="Sort by:"
          onChange={(event) => {
            setSortBy(event.target.value)
          }}
        >
          <MenuItem value={"frequency"}>Most Frequent</MenuItem>
          <MenuItem value={"code"}>Code A–Z</MenuItem>
        </Select>
      </FormControl>

        {/* insert accordions */}
      </div>

      <div
        style={{
          width: "67%",
          padding: "1rem",
          
        }}
      >
        {/* currently loads infinitely */}
        {loadingBackups || !file || !code ? (
          <CircularProgress />
        ) : (
          <FileViewer
            code={code}
            language={getLanguage(file)}
            lightMode={lightMode}
            lintErrors={lintErrors}
            key={`${file}`}
          />
        )}
      </div>
    </div>
  );
}

export default StyleTab;