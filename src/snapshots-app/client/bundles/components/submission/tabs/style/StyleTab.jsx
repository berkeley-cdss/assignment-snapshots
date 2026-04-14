import React, { useRef, useState, useMemo } from "react";

import {
  Box,
  Typography,
  Link,
  Tooltip,
  FormControlLabel,
  Alert,
  Switch,
  OutlinedInput,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  IconButton,
} from "@mui/material";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useAtom } from "jotai";
import { backupsAtom } from "../../../../state/atoms";

import { useParams } from "react-router";

import FileViewer from "./FileViewer";
import InfoTooltip from "../../../common/InfoTooltip";

const URL_PREFIX = "https://docs.astral.sh/ruff/rules/";

function StyleTab() {
  const routeParams = useParams();

  const [backups, setBackups] = useAtom(backupsAtom);
  const [files, setFiles] = React.useState([]);
  const [file, setFile] = React.useState("");
  const [code, setCode] = React.useState("");
  const [lightMode, setLightMode] = React.useState(false);
  const [lintErrors, setLintErrors] = React.useState([]);

  const [sortBy, setSortBy] = useState("most frequent");
  const [selectedFilters, setSelectedFilters] = useState([]);

  const editorRef = useRef(null);

  // Helper to extract the rule name from the URL
  const getRuleName = (url) =>
    url ? url.replace(URL_PREFIX, "").replace(/\/$/, "") : "unknown";

  // Generate combined "Code: Name" options for the filter
  const filterOptions = useMemo(() => {
    const options = new Set();
    lintErrors.forEach((err) => {
      const code = err.code ?? "N/A";
      const name = getRuleName(err.url);
      options.add(`${code}: ${name}`);
    });
    return Array.from(options).sort();
  }, [lintErrors]);

  const renderTextWithCode = (text) => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  function jumpToError(lineNumber, column) {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(lineNumber);
      editorRef.current.setPosition({ lineNumber: lineNumber, column: column });
      editorRef.current.trigger("snapshots-app", "editor.action.marker.next");
    }
  }

  React.useEffect(() => {
    fetch(
      `/api/backups/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
      { method: "GET" },
    )
      .then((response) => response.json())
      .then((responseData) => {
        setBackups(responseData.backups.toReversed());
        setFiles(responseData.assignment_file_names);
        setFile(responseData.assignment_file_names[0]);
      });
  }, [routeParams, setBackups]);

  React.useEffect(() => {
    if (backups.length === 0 || file === "") return;
    const codeQueryParams = new URLSearchParams();
    codeQueryParams.append(
      "object_key",
      `${backups[backups.length - 1].file_contents_location}/${file}`,
    );

    fetch(`/api/files?${codeQueryParams}`)
      .then((response) => response.json())
      .then((responseData) => setCode(responseData.file_contents));
  }, [backups, file]);

  React.useEffect(() => {
    if (backups.length === 0 || file === "") return;
    const lintErrorsQueryParams = new URLSearchParams();
    lintErrorsQueryParams.append(
      "file_contents_location",
      `${backups[backups.length - 1].file_contents_location}/${file}`,
    );

    fetch(`/api/lint_errors?${lintErrorsQueryParams}`)
      .then((response) => response.json())
      .then((responseData) => {
        setLintErrors(responseData.lint_errors);
        setSelectedFilters([]);
      });
  }, [backups, file]);

  function getLanguage(file) {
    const extension = file.split(".").pop();
    return extension === "py" ? "python" : "text";
  }

  const lintErrorsByCode = useMemo(() => {
    const groups = new Map();

    // Filter logic matches against the combined string
    const filteredErrors = lintErrors.filter((err) => {
      if (selectedFilters.length === 0) return true;
      const combinedString = `${err.code ?? "N/A"}: ${getRuleName(err.url)}`;
      return selectedFilters.includes(combinedString);
    });

    for (const err of filteredErrors) {
      const key = err.code ?? "(no code)";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(err);
    }

    const entries = Array.from(groups.entries());
    if (sortBy === "most frequent") {
      entries.sort((a, b) => b[1].length - a[1].length);
    } else if (sortBy === "least frequent") {
      entries.sort((a, b) => a[1].length - b[1].length);
    } else {
      entries.sort((a, b) => a[0].localeCompare(b[0]));
    }
    return entries;
  }, [lintErrors, sortBy, selectedFilters]);

  return (
    <div
      style={{ display: "flex", height: "calc(100vh - 160px)", minHeight: 0 }}
    >
      <div
        style={{
          width: "33%",
          overflowY: "auto",
          borderRight: "1px solid #ccc",
          padding: "1rem",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "top",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingBottom: "2rem",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Lint Errors
            </Typography>
            <InfoTooltip
              info="View lint errors for the student's final backup"
              placement="right"
            />
          </div>
          <div>
            <FormControlLabel
            control={
              <Switch
                checked={lightMode}
                onChange={(e) => setLightMode(e.target.checked)}
              />
            }
            label={lightMode ? "Light" : "Dark"}
          />

          </div>

        </div>

        {/* Multi-Select with combined "Code: Name" chips */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="filter-codes-label">Filter Errors</InputLabel>
          <Select
            labelId="filter-codes-label"
            multiple
            value={selectedFilters}
            onChange={(e) =>
              setSelectedFilters(
                typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value,
              )
            }
            input={<OutlinedInput label="Filter Errors" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          >
            {filterOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="file-select-label">File</InputLabel>
          <Select
            labelId="file-select-label"
            value={file}
            label="File"
            onChange={(e) => {
              setFile(e.target.value);
              setCode("");
            }}
          >
            {files.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="style-sort-label">Sort</InputLabel>
          <Select
            labelId="style-sort-label"
            value={sortBy}
            label="Sort"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value={"most frequent"}>Most Frequent</MenuItem>
            <MenuItem value={"least frequent"}>Least Frequent</MenuItem>
            <MenuItem value={"code"}>Code A-Z</MenuItem>
          </Select>
        </FormControl>

        <Alert severity="warning" sx={{ mb: "1rem" }}>
          Showing{" "}
          {lintErrorsByCode.reduce((acc, curr) => acc + curr[1].length, 0)} of{" "}
          {lintErrors.length} errors
        </Alert>

        {lintErrorsByCode.map(([errorCode, errorsForCode]) => (
          <Accordion key={errorCode} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1" sx={{ pr: 1 }}>
                <Link
                  href={errorsForCode[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {errorCode}
                </Link>
                : {getRuleName(errorsForCode[0].url)} ({errorsForCode.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {errorsForCode.map((err, index) => (
                <Box
                  key={`${err.start_location_row}-${err.start_location_col}-${index}`}
                  sx={{ mb: index < errorsForCode.length - 1 ? 2 : 0 }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Line {err.start_location_row}, col {err.start_location_col}
                    <Tooltip
                      title="Jump to lint error location in file viewer"
                      placement="right"
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          jumpToError(
                            err.start_location_row,
                            err.start_location_col,
                          )
                        }
                        color="primary"
                      >
                        <SkipNextIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {renderTextWithCode(err.message)}
                  </Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>

      <div style={{ width: "67%", padding: "1rem" }}>
        {code === "" ? (
          <CircularProgress />
        ) : (
          <FileViewer
            editorRef={editorRef}
            code={code}
            language={getLanguage(file)}
            lightMode={lightMode}
            lintErrors={lintErrors}
            key={file}
          />
        )}
      </div>
    </div>
  );
}

export default StyleTab;
