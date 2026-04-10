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


// TODO: consolidate
import { FormControl, InputLabel } from "@mui/material";
import { Select } from "@mui/material";
import { MenuItem } from "@mui/material";


function StyleTab({ lintErrors = [], code, language, lightMode }) {
  const editorRef = useRef(null);
  const [expandedCodes, setExpandedCodes] = useState(new Set()); //for accordions
  const [sortBy, setSortBy] = useState("frequency"); // defaults to sort by frequency
  const [filterCode, setFilterCode] = useState(null); // null = show all

  // group lint errors by code, sorted by frequency desc
  const groupedErrors = useMemo(() => {
    const groups = {};
    for (const error of lintErrors) {
      if (!groups[error.code]) {
        groups[error.code] = { code: error.code, message: error.message, errors: [] };
      }
      groups[error.code].errors.push(error);
    }

    // sort groups based on sortBy value
    const sorted = Object.values(groups);
    if (sortBy === "frequency") {
      sorted.sort((a, b) => b.errors.length - a.errors.length);
    } else {
      sorted.sort((a, b) => a.code.localeCompare(b.code));
    }

    return sorted;
  }, [lintErrors, sortBy]);

  const visibleGroups = filterCode
    ? groupedErrors.filter((g) => g.code === filterCode)
    : groupedErrors;

  function toggleAccordion(code) {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
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


      <div style={{ width: "67%", padding: "1rem" }}>
        {/* placeholder for FileViewer */}
      </div>
    </div>
  );
}

export default StyleTab;