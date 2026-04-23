import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Button,
  MenuItem,
  TextField,
  Tooltip,
  IconButton,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { DiffEditor } from "@monaco-editor/react";
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router";

import InfoTooltip from "../../../common/InfoTooltip";

const formatTimestamp = (isoString) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
};

const PrintStatements = () => {
  const [diffData, setDiffData] = useState([]);
  const routeParams = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  useEffect(() => {
    fetch(
      `/api/debugging/print_statements/${routeParams.courseId}/${routeParams.assignmentId}/${routeParams.studentId}`,
    )
      .then((response) => response.json())
      .then((responseData) => setDiffData(responseData));
  }, [routeParams]);

  // Sort by timestamp, descending order (Newest first)
  const sortedData = useMemo(
    () =>
      [...diffData].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      ),
    [diffData],
  );

  const [selectedId, setSelectedId] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(
    // sortedData[0]?.files[0]?.name || "",
    "ants.py",
  );

  // Default to the most recent event (first in sorted array)
  useEffect(() => {
    if (sortedData.length > 0) {
      setSelectedId(sortedData[0].id);
    }
  }, [sortedData]);

  // Group by problem (this maintains the descending order from sortedData)
  const groupedData = useMemo(() => {
    return sortedData.reduce((acc, item) => {
      if (!acc[item.problem]) acc[item.problem] = [];
      acc[item.problem].push(item);
      return acc;
    }, {});
  }, [sortedData]);

  const currentItem = useMemo(
    () => sortedData.find((d) => d.id === selectedId),
    [selectedId, sortedData],
  );

  // Auto-select first file
  // useMemo(() => {
  //   if (
  //     currentItem &&
  //     (!selectedFileName ||
  //       !currentItem.files.find((f) => f.name === selectedFileName))
  //   ) {
  //     setSelectedFileName(currentItem.files[0]?.name || "");
  //   }
  // }, [currentItem, selectedFileName]);

  // Logic to find the previous version for the diff
  const getOriginalContents = (problem, timestamp, fileName) => {
    const previousBackups = sortedData
      .filter(
        (d) =>
          d.problem === problem && new Date(d.timestamp) < new Date(timestamp),
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (previousBackups.length === 0) return ""; // first backup has no previous version

    const lastBackup = previousBackups[0];
    const file = lastBackup.files.find((f) => f.name === fileName);
    return file ? file.contents : "";
  };

  const modifiedContents =
    currentItem?.files.find((f) => f.name === selectedFileName)?.contents || "";
  const originalContents = getOriginalContents(
    currentItem?.problem,
    currentItem?.timestamp,
    selectedFileName,
  );

  return (
    <Box sx={{ display: "flex", height: "80vh", gap: 2 }}>
      {/* Left Sidebar */}
      <Paper
        variant="outlined"
        sx={{ width: 340, p: 2, overflowY: "auto", backgroundColor: "#f8f9fa" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Print Statements
          </Typography>
          <InfoTooltip
            info="This page shows backups right before and after print statements were added. Select backups to view a unified diff of that backup and its previous version, and use the dropdown to view different files."
            placement="right"
          />
        </div>

        {/* Sort problems by ID if desired, otherwise they appear in order of most recent activity */}
        {Object.keys(groupedData).map((problemId) => (
          <Box key={problemId} sx={{ mb: 4 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1.5, fontWeight: "bold" }}
            >
              {problemId}
            </Typography>
            <Stack spacing={1}>
              {groupedData[problemId].map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box
                    sx={{
                      width: 24,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {selectedFileName &&
                      item.files.find((f) => f.name === selectedFileName)
                        ?.hasPrint && (
                        <Tooltip title="This backup contains a print statement for the selected file">
                          <PrintIcon color="primary" sx={{ fontSize: 20 }} />
                        </Tooltip>
                      )}
                  </Box>
                  <Button
                    variant={selectedId === item.id ? "contained" : "outlined"}
                    onClick={() => setSelectedId(item.id)}
                    fullWidth
                    sx={{
                      py: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      textTransform: "none",
                      borderLeft:
                        selectedId === item.id ? "4px solid" : "1px solid",
                      borderColor:
                        selectedId === item.id ? "primary.main" : "divider",
                    }}
                  >
                    <Typography variant="caption">
                      {formatTimestamp(item.timestamp)}
                    </Typography>
                    {item.passing ? (
                      <Tooltip title="All tests passed">
                        <CheckCircleIcon
                          sx={{
                            fontSize: 18,
                            color:
                              selectedId === item.id ? "#fff" : "success.main",
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Some or all tests failed">
                        <ErrorIcon
                          sx={{
                            fontSize: 18,
                            color:
                              selectedId === item.id ? "#ffcdd2" : "error.main",
                          }}
                        />
                      </Tooltip>
                    )}
                  </Button>

                  <Tooltip title="Open in Timeline">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => {
                        navigate(
                          `/courses/${routeParams.courseId}/assignments/${routeParams.assignmentId}/students/${routeParams.studentId}/submission/timeline/${item.id}`,
                        );
                      }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Paper>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          border: "1px solid #ddd",
          borderRadius: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 1.5,
            backgroundColor: "#eee",
            borderBottom: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontFamily: "monospace" }}>
            Diff with previous backup
          </Typography>

          <TextField
            select
            size="small"
            value={selectedFileName}
            onChange={(e) => setSelectedFileName(e.target.value)}
            sx={{ minWidth: 150, backgroundColor: "#fff" }}
          >
            {currentItem?.files.map((f) => (
              <MenuItem key={f.name} value={f.name}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          {selectedId && selectedFileName && (
            <DiffEditor
              height="100%"
              language="python"
              original={originalContents}
              modified={modifiedContents}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                renderSideBySide: false,
                readOnly: true,
                fontSize: 13,
                automaticLayout: true,
                // Enable the auto-collapse feature
                hideUnchangedRegions: {
                  enabled: true,
                  contextLineCount: 5, // Lines of unchanged code to show around a diff
                  minimumLineCount: 3, // Minimum unchanged lines required to trigger a collapse
                  revealLineCount: 20, // How many lines to reveal when clicking the "expand" button
                },
              }}
              keepCurrentOriginalModel={true}
              keepCurrentModifiedModel={true}
              // force rerendering (?) so that the diff editor correctly hides unchanged regions
              key={selectedId}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PrintStatements;
